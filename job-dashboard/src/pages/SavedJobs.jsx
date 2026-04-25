import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import { useToast } from '../components/Toast'
import Sidebar from '../components/Sidebar'
import JobTable from '../components/JobTable'
import { Bookmark, Trash2 } from 'lucide-react'

const SavedJobs = () => {
  const toast = useToast()
  const [savedJobs, setSavedJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)

  // Fetch current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
      
      if (!user) {
        setLoading(false)
      }
    }
    getUser()
  }, [])

  // Fetch saved jobs
  const fetchSavedJobs = useCallback(async () => {
    if (!currentUser) return

    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('saved_jobs')
        .select(`
          id,
          job_id,
          jobs (*)
        `)
        .eq('user_id', currentUser.id)
        .order('id', { ascending: false })

      if (error) {
        console.error('Error fetching saved jobs:', error)
        setSavedJobs([])
      } else {
        // Transform data to match JobTable format
        const transformedJobs = (data || [])
          .filter((item) => item.jobs)
          .map((item) => ({
            ...item.jobs,
            saved_job_id: item.id,
          }))
        
        setSavedJobs(transformedJobs)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      toast.error('Failed to load saved jobs')
    } finally {
      setLoading(false)
    }
  }, [currentUser, toast])

  useEffect(() => {
    fetchSavedJobs()
  }, [fetchSavedJobs])

  // Remove saved job
  const handleRemove = async (jobId) => {
    try {
      const { error } = await supabase
        .from('saved_jobs')
        .delete()
        .eq('user_id', currentUser.id)
        .eq('job_id', jobId)

      if (error) throw error
      
      setSavedJobs((prev) => prev.filter((job) => job.id !== jobId))
      toast.success('Job removed from saved')
    } catch (err) {
      console.error('Remove error:', err)
      toast.error('Failed to remove job')
      throw err
    }
  }

  // Create a custom action for removing saved jobs
  const handleUnsave = async (jobId) => {
    await handleRemove(jobId)
  }

  return (
    <div className="min-h-screen bg-secondary-50 flex">
      <Sidebar />

      <main className="flex-1 lg:ml-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-secondary-200 flex items-center px-4 lg:px-8">
          <div className="flex items-center gap-3 ml-12 lg:ml-0">
            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-secondary-800">Saved Jobs</h1>
              <p className="text-xs text-secondary-500">Your bookmarked job listings</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 lg:p-8">
          {!currentUser ? (
            <div className="card p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-secondary-100 rounded-full flex items-center justify-center">
                <Bookmark className="w-8 h-8 text-secondary-400" />
              </div>
              <h3 className="text-lg font-medium text-secondary-700 mb-1">
                Sign in required
              </h3>
              <p className="text-secondary-500 text-sm">
                Please log in to view your saved jobs
              </p>
            </div>
          ) : (
            <JobTable
              jobs={savedJobs}
              loading={loading}
              onDelete={handleUnsave}
              savedJobIds={new Set(savedJobs.map((j) => j.id))}
              showSaveButton={false}
            />
          )}
        </div>
      </main>
    </div>
  )
}

export default SavedJobs