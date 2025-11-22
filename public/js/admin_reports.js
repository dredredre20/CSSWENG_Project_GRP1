// Navigate to the report page
function navigateToReports(sdw_id, report_type){
    // change url as needed
    window.location.href = `/admin/reports/${sdw_id}/${encodeURIComponent(report_type)}`;
}