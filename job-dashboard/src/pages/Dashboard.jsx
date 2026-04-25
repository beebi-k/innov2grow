import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import { useToast } from '../components/Toast'
import Sidebar from '../components/Sidebar'
import JobForm from '../components/JobForm'
import JobTable from '../components/JobTable'
import { Briefcase, Plus, X } from 'lucide-react'

const Dashboard = () => {
  const toast = useToast()
  const [jobs, setJobs] = useState([])
  const [savedJobIds, setSavedJobIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [editingJob, setEditingJob] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  // Fetch current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
    }
    getUser()
  }, [])

  // Fetch jobs
  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true)
      
      // Fetch jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })

      if (jobsError) {
        console.error('Error fetching jobs:', jobsError)
        // If table doesn't exist, show empty state
        if (jobsError.code === 'PGRST116' || jobsError.message?.includes('does not exist')) {
          setJobs([])
        }
      } else {
        setJobs(jobsData || [])
      }

      // Fetch saved jobs if user is logged in
      if (currentUser) {
        const { data: savedData, error: savedError } = await supabase
          .from('saved_jobs')
          .select('job_id')
          .eq('user_id', currentUser.id)

        if (!savedError && savedData) {
          setSavedJobIds(new Set(savedData.map((s) => s.job_id)))
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      toast.error('Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }, [currentUser, toast])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  // Create or update job
  const handleSubmit = async (jobData) => {
    try {
      if (editingJob) {
        // Update existing job
        const { error } = await supabase
          .from('jobs')
          .update({
            title: jobData.title,
            salary: jobData.salary,
            location: jobData.location,
          })
          .eq('id', editingJob.id)

        if (error) throw error
        toast.success('Job updated successfully!')
        setEditingJob(null)
        setShowForm(false)
      } else {
        // Create new job
        const { error } = await supabase
          .from('jobs')
          .insert([jobData])

        if (error) throw error
        toast.success('Job created successfully!')
        setShowForm(false)
      }
      
      await fetchJobs()
    } catch (err) {
      console.error('Submit error:', err)
      toast.error(editingJob ? 'Failed to update job' : 'Failed to create job')
      throw err
    }
  }

  // Edit job
  const handleEdit = (job) => {
    setEditingJob(job)
    setShowForm(true)
  }

  // Delete job
  const handleDelete = async (jobId) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId)

      if (error) throw error
      toast.success('Job deleted successfully!')
      await fetchJobs()
    } catch (err) {
      console.error('Delete error:', err)
      toast.error('Failed to delete job')
      throw err
    }
  }

  // Save/unsave job
  const handleSave = async (jobId) => {
    if (!currentUser) {
      toast.warning('Please log in to save jobs')
      return
    }

    try {
      if (savedJobIds.has(jobId)) {
        // Unsave
        const { error } = await supabase
          .from('saved_jobs')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('job_id', jobId)

        if (error) throw error
        setSavedJobIds((prev) => {
          const newSet = new Set(prev)
          newSet.delete(jobId)
          return newSet
        })
        toast.info('Job removed from saved')
      } else {
        // Save
        const { error } = await supabase
          .from('saved_jobs')
          .insert([{ user_id: currentUser.id, job_id: jobId }])

        if (error) throw error
        setSavedJobIds((prev) => new Set([...prev, jobId]))
        toast.success('Job saved successfully!')
      }
    } catch (err) {
      console.error('Save error:', err)
      toast.error('Failed to save job')
    }
  }

  const handleCancelEdit = () => {
    setEditingJob(null)
    setShowForm(false)
  }

  return (
    <div className="min-h-screen bg-secondary-50 flex">
      <Sidebar />

      <main className="flex-1 lg:ml-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-secondary-200 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3 ml-12 lg:ml-0">
            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-secondary-800">Jobs</h1>
              <p className="text-xs text-secondary-500">Manage your job listings</p>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingJob(null)
              setShowForm(!showForm)
            }}
            className="btn-primary flex items-center gap-2"
          >
            {showForm ? (
              <>
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Close Form</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Job</span>
              </>
            )}
          </button>
        </header>

        {/* Content */}
        <div className="p-4 lg:p-8 space-y-6">
          {/* Form */}
          {showForm && (
            <div className="animate-fade-in">
              <JobForm
                onSubmit={handleSubmit}
                initialData={editingJob}
                isEditing={!!editingJob}
                onCancel={handleCancelEdit}
              />
            </div>
          )}

          {/* Table */}
          <JobTable
            jobs={jobs}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSave={handleSave}
            savedJobIds={savedJobIds}
            showSaveButton={true}
          />
        </div>
      </main>
    </div>
  )
}

export default Dashboard