from datetime import date

from django.http import FileResponse
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from obra.models import Construction
from .services.data_service import get_physical_advance_data
from .services.excel_service import generate_physical_advance_excel


class PhysicalAdvanceReportView(APIView):
    """
    GET /api/reportes/physical-advance/
      ?construction_id=<int>
      &date_from=<YYYY-MM-DD>
      &date_to=<YYYY-MM-DD>

    Returns an Excel file (.xlsx) with a table of physical advances
    for the selected construction and date range.
    """

    def get(self, request):
        # ── 1. Validate required params ──────────────────────────────────
        construction_id = request.query_params.get('construction_id')
        date_from_str   = request.query_params.get('date_from')
        date_to_str     = request.query_params.get('date_to')

        missing = [
            p for p, v in [
                ('construction_id', construction_id),
                ('date_from', date_from_str),
                ('date_to', date_to_str),
            ]
            if not v
        ]
        if missing:
            return Response(
                {'error': f"Missing required parameters: {', '.join(missing)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── 2. Parse & validate dates ────────────────────────────────────
        try:
            date_from = date.fromisoformat(date_from_str)
            date_to   = date.fromisoformat(date_to_str)
        except ValueError:
            return Response(
                {'error': 'Invalid date format. Use YYYY-MM-DD.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if date_from > date_to:
            return Response(
                {'error': 'date_from must be on or before date_to.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── 3. Resolve construction ──────────────────────────────────────
        try:
            construction = Construction.objects.get(pk=construction_id)
        except Construction.DoesNotExist:
            return Response(
                {'error': f'Construction {construction_id} not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        # ── 4. Fetch data & generate Excel ───────────────────────────────
        rows = get_physical_advance_data(construction, date_from, date_to)
        buffer = generate_physical_advance_excel(construction, rows, date_from, date_to)

        filename = (
            f"Avance_Fisico_{construction.name.replace(' ', '_')}"
            f"_{date_from_str}_al_{date_to_str}.xlsx"
        )
        content_type = (
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )

        return FileResponse(
            buffer,
            as_attachment=True,
            filename=filename,
            content_type=content_type,
        )
