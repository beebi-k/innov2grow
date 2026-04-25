import { useState, useMemo } from 'react'
import { 
  Search, 
  Edit2, 
  Trash2, 
  Bookmark, 
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Briefcase,
  MapPin,
  DollarSign,
  AlertTriangle
} from 'lucide-react'

const JobTable = ({ 
  jobs = [], 
  loading = false, 
  onEdit, 
  onDelete, 
  onSave,
  savedJobIds = new Set(),
  showSaveButton = true
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const itemsPerPage = 8

  // Filter jobs based on search query
  const filteredJobs = useMemo(() => {
    if (!searchQuery.trim()) return jobs
    
    const query = searchQuery.toLowerCase()
    return jobs.filter(
      (job) =>
        job.title?.toLowerCase().includes(query) ||
        job.location?.toLowerCase().includes(query)
    )
  }, [jobs, searchQuery])

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage)
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Reset to first page when search changes
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const handleDelete = async (jobId) => {
    setActionLoading(jobId)
    try {
      await onDelete(jobId)
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Delete error:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleSave = async (jobId) => {
    setActionLoading(`save-${jobId}`)
    try {
      await onSave(jobId)
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleEdit = (job) => {
    if (onEdit) onEdit(job)
  }

  // Format salary
  const formatSalary = (salary) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(salary)
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-secondary-100">
          <div className="skeleton h-10 w-64 rounded-lg"></div>
        </div>
        <div className="p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="skeleton h-12 flex-1 rounded"></div>
              <div className="skeleton h-8 w-24 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      {/* Search Bar */}
      <div className="p-4 border-b border-secondary-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
          <input
            type="text"
            placeholder="Search by title or location..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="input-modern pl-10"
          />
        </div>
      </div>

      {/* Table */}
      {filteredJobs.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-secondary-100 rounded-full flex items-center justify-center">
            <Briefcase className="w-8 h-8 text-secondary-400" />
          </div>
          <h3 className="text-lg font-medium text-secondary-700 mb-1">
            {searchQuery ? 'No jobs found' : 'No jobs yet'}
          </h3>
          <p className="text-secondary-500 text-sm">
            {searchQuery 
              ? 'Try adjusting your search terms' 
              : 'Create your first job to get started'}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Location</th>
                  <th>Salary</th>
                  <th>Created</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedJobs.map((job) => (
                  <tr key={job.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                          <Briefcase className="w-5 h-5 text-primary-600" />
                        </div>
                        <span className="font-medium text-secondary-800">{job.title}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 text-secondary-600">
                        <MapPin className="w-4 h-4 text-secondary-400" />
                        {job.location}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 text-secondary-600">
                        <DollarSign className="w-4 h-4 text-secondary-400" />
                        {formatSalary(job.salary)}
                      </div>
                    </td>
                    <td className="text-secondary-500">
                      {new Date(job.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        {showSaveButton && (
                          <button
                            onClick={() => handleSave(job.id)}
                            disabled={actionLoading === `save-${job.id}`}
                            className={`p-2 rounded-lg transition-all duration-200 ${
                              savedJobIds.has(job.id)
                                ? 'bg-primary-100 text-primary-600 hover:bg-primary-200'
                                : 'hover:bg-secondary-100 text-secondary-400 hover:text-primary-600'
                            }`}
                            title={savedJobIds.has(job.id) ? 'Saved' : 'Save'}
                          >
                            {actionLoading === `save-${job.id}` ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : savedJobIds.has(job.id) ? (
                              <BookmarkCheck className="w-4 h-4" />
                            ) : (
                              <Bookmark className="w-4 h-4" />
                            )}
                          </button>
                        )}

                        {onEdit && (
                          <button
                            onClick={() => handleEdit(job)}
                            disabled={actionLoading === job.id}
                            className="p-2 rounded-lg hover:bg-secondary-100 text-secondary-400 hover:text-secondary-600 transition-all duration-200"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}

                        {onDelete && (
                          <>
                            {deleteConfirm === job.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDelete(job.id)}
                                  disabled={actionLoading === job.id}
                                  className="p-2 rounded-lg bg-danger-100 text-danger-600 hover:bg-danger-200 transition-all duration-200"
                                  title="Confirm Delete"
                                >
                                  {actionLoading === job.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <AlertTriangle className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  disabled={actionLoading === job.id}
                                  className="p-2 rounded-lg hover:bg-secondary-100 text-secondary-400 transition-all duration-200"
                                  title="Cancel"
                                >
                                  <span className="text-sm">×</span>
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirm(job.id)}
                                className="p-2 rounded-lg hover:bg-danger-50 text-secondary-400 hover:text-danger-600 transition-all duration-200"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-secondary-100 flex items-center justify-between">
              <p className="text-sm text-secondary-500">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredJobs.length)} of{' '}
                {filteredJobs.length} jobs
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg hover:bg-secondary-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-lg font-medium transition-all duration-200 ${
                      currentPage === i + 1
                        ? 'bg-primary-600 text-white'
                        : 'hover:bg-secondary-100 text-secondary-600'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg hover:bg-secondary-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default JobTable