from dataclasses import dataclass
from datetime import date
from typing import Literal

from django.db.models import DecimalField, ExpressionWrapper, F, Sum, Q

from obra.models import Construction
from catalogo.models import Catalog, Concept


@dataclass
class PhysicalAdvanceRow:
    work_item_name: str
    concept_description: str
    unit: str
    contracted_qty: float
    executed_in_range: float   # volume registered in the selected date range
    period_pct: float          # executed_in_range / contracted_qty * 100
    importe_periodo: float     # executed_in_range * unit_price
    total_executed: float      # cumulative volume (all time)
    importe_total: float       # total_executed * unit_price
    progress_pct: float        # total_executed / contracted_qty * 100


@dataclass
class PhysicalAdvanceTableData:
    catalog_id: int
    catalog_name: str
    rows: list[PhysicalAdvanceRow]
    catalog_total_value: float   # Σ (qty × unit_price) — always the full catalog, scope-independent


def _build_rows(concepts) -> list[PhysicalAdvanceRow]:
    rows = []
    for concept in concepts:
        contracted_qty = float(concept.quantity)
        unit_price = float(concept.unit_price)
        exec_in_range = float(concept.executed_in_range or 0)
        total_exec = float(concept.total_executed or 0)

        period_pct = (exec_in_range / contracted_qty * 100) if contracted_qty > 0 else 0.0
        progress_pct = (total_exec / contracted_qty * 100) if contracted_qty > 0 else 0.0

        rows.append(
            PhysicalAdvanceRow(
                work_item_name=concept.work_item.name,
                concept_description=concept.description,
                unit=concept.unit,
                contracted_qty=contracted_qty,
                executed_in_range=exec_in_range,
                period_pct=round(period_pct, 2),
                importe_periodo=round(exec_in_range * unit_price, 2),
                total_executed=total_exec,
                importe_total=round(total_exec * unit_price, 2),
                progress_pct=round(progress_pct, 2),
            )
        )
    return rows


def get_physical_advance_data(
    construction: Construction,
    date_from: date,
    date_to: date,
    scope: Literal['all', 'period'] = 'all',
    catalog_ids: list[int] | None = None,
) -> list[PhysicalAdvanceTableData]:
    """
    Returns one PhysicalAdvanceTableData per catalog.

    catalog_ids=None  → all active catalogs for the construction
    catalog_ids=[...] → only the specified catalogs (already validated by the view)

    scope='all'    → all active concepts per catalog
    scope='period' → only concepts with at least one advance in the date range
    """
    catalogs = Catalog.objects.filter(construction=construction, is_active=True)
    if catalog_ids:
        catalogs = catalogs.filter(id__in=catalog_ids)

    result = []

    for catalog in catalogs:
        base_filter = dict(catalog=catalog, is_active=True)

        # Query 1: full catalog value — scope-independent denominator
        catalog_total_value = float(
            Concept.objects.filter(**base_filter).aggregate(
                total=Sum(
                    ExpressionWrapper(
                        F('quantity') * F('unit_price'),
                        output_field=DecimalField(max_digits=20, decimal_places=2),
                    )
                )
            )['total'] or 0
        )

        # Query 2: annotated concepts
        concepts = (
            Concept.objects.filter(**base_filter)
            .select_related('work_item')
            .annotate(
                executed_in_range=Sum(
                    'physical_progress__volume',
                    filter=Q(
                        physical_progress__date__date__gte=date_from,
                        physical_progress__date__date__lte=date_to,
                    ),
                ),
                total_executed=Sum('physical_progress__volume'),
            )
            .order_by('work_item__id', 'id')
        )

        if scope == 'period':
            concepts = concepts.filter(executed_in_range__gt=0)

        result.append(
            PhysicalAdvanceTableData(
                catalog_id=catalog.id,
                catalog_name=catalog.name or f'Catálogo {catalog.id}',
                rows=_build_rows(concepts),
                catalog_total_value=catalog_total_value,
            )
        )

    return result
