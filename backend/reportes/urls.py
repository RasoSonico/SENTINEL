from django.urls import path
from .views import PhysicalAdvanceReportView

urlpatterns = [
    path('physical-advance/', PhysicalAdvanceReportView.as_view(), name='report-physical-advance'),
]
