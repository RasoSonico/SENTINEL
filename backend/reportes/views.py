from datetime import date

from django.http import FileResponse
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from catalogo.models import Catalog
from obra.models import Construction
from .services.data_service import get_physical_advance_data
from .services.excel_service import generate_physical_advance_excel

_VALID_SCOPES = ('all', 'period')


class PhysicalAdvanceReportView(APIView):
    """
    GET /api/reportes/physical-advance/
      ?construction_id=<int>          required
      &date_from=<YYYY-MM-DD>         required
      &date_to=<YYYY-MM-DD>           required
      &scope=<all|period>             optional, default: all
      &catalog_ids=<int,int,...>      optional, default: all active catalogs

    Returns an Excel file with one sheet per catalog.
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

        # ── 3. Validate scope ────────────────────────────────────────────
        scope = request.query_params.get('scope', 'all')
        if scope not in _VALID_SCOPES:
            return Response(
                {'error': f"scope must be one of: {', '.join(_VALID_SCOPES)}."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── 4. Resolve construction ──────────────────────────────────────
        try:
            construction = Construction.objects.get(pk=construction_id)
        except Construction.DoesNotExist:
            return Response(
                {'error': f'Construction {construction_id} not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        # ── 5. Parse & validate catalog_ids (optional) ───────────────────
        catalog_ids = None
        catalog_ids_str = request.query_params.get('catalog_ids')

        if catalog_ids_str:
            try:
                catalog_ids = list({int(x.strip()) for x in catalog_ids_str.split(',')})
            except ValueError:
                return Response(
                    {'error': 'catalog_ids must be comma-separated integers. E.g. catalog_ids=1,3,5'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            valid_ids = set(
                Catalog.objects.filter(
                    id__in=catalog_ids,
                    construction=construction,
                    is_active=True,
                ).values_list('id', flat=True)
            )
            invalid = sorted(set(catalog_ids) - valid_ids)
            if invalid:
                return Response(
                    {'error': f'Catalogs not found or inactive for this construction: {invalid}'},
                    status=status.HTTP_404_NOT_FOUND,
                )

        # ── 6. Fetch data & generate Excel ───────────────────────────────
        catalogs_data = get_physical_advance_data(construction, date_from, date_to, scope, catalog_ids)

        if not catalogs_data:
            return Response(
                {'error': 'No active catalogs found for this construction.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        buffer = generate_physical_advance_excel(construction, catalogs_data, date_from, date_to, scope)

        if date_from == date_to:
            filename_date = date_from_str
        else:
            filename_date = f"{date_from_str}_al_{date_to_str}"

        filename = f"Avance_Fisico_{construction.name.replace(' ', '_')}_{filename_date}.xlsx"

        return FileResponse(
            buffer,
            as_attachment=True,
            filename=filename,
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        )
