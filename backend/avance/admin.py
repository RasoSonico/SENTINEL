from django.contrib import admin
from .models import Physical, PhysicalStatusHistory, Estimation, EstimationDetail, CommitmentTracking, Photo


class PhysicalStatusHistoryInline(admin.TabularInline):
    model = PhysicalStatusHistory
    extra = 0
    readonly_fields = ('previous_status', 'new_status', 'changed_at', 'changed_by')


@admin.register(Physical)
class PhysicalAdmin(admin.ModelAdmin):
    list_display = ('id', 'concept', 'volume', 'status', 'date')
    list_filter = ('status', 'date')
    search_fields = ('concept__description',)
    inlines = [PhysicalStatusHistoryInline]


@admin.register(Estimation)
class EstimationAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'construction', 'period_start', 'period_end', 'total_amount', 'status')
    list_filter = ('status', 'is_planned', 'based_on_schedule')
    search_fields = ('name', 'construction__name')


@admin.register(EstimationDetail)
class EstimationDetailAdmin(admin.ModelAdmin):
    list_display = ('id', 'estimation', 'concept', 'volume', 'amount', 'commitment_status')
    list_filter = ('commitment_status', 'imported_from_schedule')
    search_fields = ('concept__description', 'estimation__name')


@admin.register(CommitmentTracking)
class CommitmentTrackingAdmin(admin.ModelAdmin):
    list_display = ('id', 'estimation_detail', 'planned_date', 'actual_date', 'status')
    list_filter = ('status', 'planned_date')


@admin.register(Photo)
class PhotoAdmin(admin.ModelAdmin):
    list_display = ('id', 'original_filename', 'construction', 'uploaded_by', 'upload_status', 'uploaded_at')
    list_filter = ('upload_status', 'uploaded_at')
    search_fields = ('original_filename', 'construction__name')
    readonly_fields = ('id', 'uploaded_at', 'file_size_bytes', 'image_width', 'image_height', 'exif_data')
