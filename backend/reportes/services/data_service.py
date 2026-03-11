from dataclasses import dataclass
from datetime import date

from django.db.models import Sum, Q

from obra.models import Construction
from catalogo.models import Concept


@dataclass
class ConceptProgressRow:
    work_item_name: str
    concept_description: str
    unit: str
    contracted_qty: float
    executed_in_range: float   # volume registered in the selected date range
    total_executed: float      # cumulative volume (all time)
    progress_pct: float        # total_executed / contracted_qty * 100
    importe_periodo: float     # executed_in_range * unit_price
    importe_total: float       # total_executed * unit_price


def get_physical_advance_data(
    construction: Construction,
    date_from: date,
    date_to: date,
) -> list[ConceptProgressRow]:
    """
    Returns one row per active concept in the construction, with:
    - Volume registered within the given date range (all statuses)
    - Cumulative volume all-time (all statuses)
    - % progress against contracted quantity
    - Monetary import for the period and cumulative (volume × unit_price)

    Uses a single DB query with annotations for performance.
    """
    concepts = (
        Concept.objects.filter(
            catalog__construction=construction,
            catalog__is_active=True,
            is_active=True,
        )
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

    rows = []
    for concept in concepts:
        contracted_qty = float(concept.quantity)
        unit_price = float(concept.unit_price)
        exec_in_range = float(concept.executed_in_range or 0)
        total_exec = float(concept.total_executed or 0)
        progress_pct = (total_exec / contracted_qty * 100) if contracted_qty > 0 else 0.0

        rows.append(
            ConceptProgressRow(
                work_item_name=concept.work_item.name,
                concept_description=concept.description,
                unit=concept.unit,
                contracted_qty=contracted_qty,
                executed_in_range=exec_in_range,
                total_executed=total_exec,
                progress_pct=round(progress_pct, 2),
                importe_periodo=round(exec_in_range * unit_price, 2),
                importe_total=round(total_exec * unit_price, 2),
            )
        )

    return rows
