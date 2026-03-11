from datetime import date
from io import BytesIO

import openpyxl
from openpyxl.styles import (
    Alignment,
    Border,
    Font,
    PatternFill,
    Side,
)
from openpyxl.utils import get_column_letter

from obra.models import Construction
from .data_service import ConceptProgressRow


# ── Colour palette ──────────────────────────────────────────────────────────
_HEADER_FILL   = PatternFill("solid", fgColor="1F3864")   # dark navy
_SUBHDR_FILL   = PatternFill("solid", fgColor="2E75B6")   # medium blue
_ROW_ODD_FILL  = PatternFill("solid", fgColor="DCE6F1")   # light blue
_ROW_EVEN_FILL = PatternFill("solid", fgColor="FFFFFF")   # white
_TOTAL_FILL    = PatternFill("solid", fgColor="BDD7EE")   # soft blue

_WHITE_FONT  = Font(name="Calibri", bold=True, color="FFFFFF", size=11)
_NORMAL_FONT = Font(name="Calibri", size=10)
_TOTAL_FONT  = Font(name="Calibri", bold=True, size=10)

_THIN_SIDE   = Side(style="thin", color="B0B0B0")
_THIN_BORDER = Border(left=_THIN_SIDE, right=_THIN_SIDE, top=_THIN_SIDE, bottom=_THIN_SIDE)

# col index → (header label, column width)
_COLUMNS = [
    (1, "Partida",                        18),
    (2, "Concepto",                       40),
    (3, "Unidad",                          9),
    (4, "Cantidad\ncontratada",           14),
    (5, "Vol. ejecutado\n del periodo",   16),
    (6, "Importe\ndel periodo",           18),
    (7, "Vol. total",                     16),
    (8, "Importe\ntotal",                 18),
    (9, "% Avance\nacumulado",            14),
]

_NUM_COLS = len(_COLUMNS)


def _apply_border_and_fill(cell, fill):
    cell.fill = fill
    cell.border = _THIN_BORDER


def _write_title(ws, construction: Construction, date_from: date, date_to: date):
    """Rows 1–3: title block spanning all columns."""
    last_col = get_column_letter(_NUM_COLS)

    ws.merge_cells(f"A1:{last_col}1")
    title_cell = ws["A1"]
    title_cell.value = f"Reporte de Avance Físico — {construction.name}"
    title_cell.font = Font(name="Calibri", bold=True, size=14, color="FFFFFF")
    title_cell.fill = _HEADER_FILL
    title_cell.alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[1].height = 28

    ws.merge_cells(f"A2:{last_col}2")
    period_cell = ws["A2"]
    period_cell.value = (
        f"Período: {date_from.strftime('%d/%m/%Y')}  al  {date_to.strftime('%d/%m/%Y')}"
    )
    period_cell.font = Font(name="Calibri", size=11, color="FFFFFF")
    period_cell.fill = _SUBHDR_FILL
    period_cell.alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[2].height = 20

    ws.row_dimensions[3].height = 6  # spacer row


def _write_headers(ws):
    """Row 4: column headers."""
    ws.row_dimensions[4].height = 40
    for col_idx, header, _ in _COLUMNS:
        cell = ws.cell(row=4, column=col_idx, value=header)
        cell.font = _WHITE_FONT
        cell.fill = _HEADER_FILL
        cell.alignment = Alignment(
            horizontal="center", vertical="center", wrap_text=True
        )
        cell.border = _THIN_BORDER


def _write_data_rows(ws, rows: list[ConceptProgressRow]) -> int:
    """Rows 5+: one row per concept. Returns the last data row index."""
    for row_idx, row in enumerate(rows, start=5):
        fill = _ROW_ODD_FILL if row_idx % 2 else _ROW_EVEN_FILL

        values = [
            row.work_item_name,
            row.concept_description,
            row.unit,
            row.contracted_qty,
            row.executed_in_range,
            row.importe_periodo,
            row.total_executed,
            row.importe_total,
            row.progress_pct / 100,   # fraction for % cell format
        ]

        for col_idx, value in enumerate(values, start=1):
            cell = ws.cell(row=row_idx, column=col_idx, value=value)
            cell.font = _NORMAL_FONT
            cell.fill = fill
            cell.border = _THIN_BORDER
            cell.alignment = Alignment(vertical="center", wrap_text=True)

        ws.cell(row=row_idx, column=4).number_format = '#,##0.00'
        ws.cell(row=row_idx, column=5).number_format = '#,##0.00'
        ws.cell(row=row_idx, column=6).number_format = '"$"#,##0.00'
        ws.cell(row=row_idx, column=7).number_format = '#,##0.00'
        ws.cell(row=row_idx, column=8).number_format = '"$"#,##0.00'
        ws.cell(row=row_idx, column=9).number_format = '0.00%'

        ws.row_dimensions[row_idx].height = 18

    return 4 + len(rows)


def _write_totals(ws, rows: list[ConceptProgressRow], last_data_row: int):
    """Summary row below data. Only % Avance and import columns have values."""
    total_row = last_data_row + 1
    ws.row_dimensions[total_row].height = 20

    # Style all cells in the totals row first
    for col_idx in range(1, _NUM_COLS + 1):
        cell = ws.cell(row=total_row, column=col_idx)
        _apply_border_and_fill(cell, _TOTAL_FILL)
        cell.font = _TOTAL_FONT
        cell.alignment = Alignment(horizontal="right", vertical="center")

    # Label spanning cols 1–3
    ws.cell(row=total_row, column=1, value="TOTALES").alignment = Alignment(
        horizontal="center", vertical="center"
    )
    ws.merge_cells(
        start_row=total_row, start_column=1,
        end_row=total_row,   end_column=3,
    )


    # Importe del periodo — sum
    imp_periodo = sum(r.importe_periodo for r in rows)
    imp_p_cell = ws.cell(row=total_row, column=6, value=imp_periodo)
    imp_p_cell.number_format = '"$"#,##0.00'

    # Importe total — sum
    imp_total = sum(r.importe_total for r in rows)
    imp_t_cell = ws.cell(row=total_row, column=8, value=imp_total)
    imp_t_cell.number_format = '"$"#,##0.00'

    # % Avance acumulado — sum of individual percentages
    pct_sum = sum(r.progress_pct for r in rows) / 100
    pct_cell = ws.cell(row=total_row, column=9, value=pct_sum)
    pct_cell.number_format = '0.00%'

def _set_column_widths(ws):
    for col_idx, _, width in _COLUMNS:
        ws.column_dimensions[get_column_letter(col_idx)].width = width


def generate_physical_advance_excel(
    construction: Construction,
    rows: list[ConceptProgressRow],
    date_from: date,
    date_to: date,
) -> BytesIO:
    """
    Builds an Excel workbook with a single sheet containing the physical
    advance table. Returns a BytesIO buffer ready to stream.
    """
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Avance Físico"

    ws.freeze_panes = "A5"

    _write_title(ws, construction, date_from, date_to)
    _write_headers(ws)
    last_data_row = _write_data_rows(ws, rows)

    if rows:
        _write_totals(ws, rows, last_data_row)

    _set_column_widths(ws)

    output = BytesIO()
    wb.save(output)
    output.seek(0)
    return output
