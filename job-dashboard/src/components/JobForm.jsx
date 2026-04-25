import { useState, useEffect } from 'react'
import { Plus, Edit3, Loader2 } from 'lucide-react'

const JobForm = ({ onSubmit, initialData = null, isEditing = false, onCancel = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    salary: '',
    location: '',
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        salary: initialData.salary?.toString() || '',
        location: initialData.location || '',
      })
    }
  }, [initialData])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required'
    } else if (formData.title.trim().length < 2) {
      newErrors.title = 'Job title must be at least 2 characters'
    }

    if (!formData.salary) {
      newErrors.salary = 'Salary is required'
    } else if (isNaN(formData.salary) || parseFloat(formData.salary) <= 0) {
      newErrors.salary = 'Please enter a valid salary'
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required'
    } else if (formData.location.trim().length < 2) {
      newErrors.location = 'Location must be at least 2 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        title: formData.title.trim(),
        salary: parseFloat(formData.salary),
        location: formData.location.trim(),
      })
      
      if (!isEditing) {
        setFormData({ title: '', salary: '', location: '' })
      }
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setFormData({ title: '', salary: '', location: '' })
    setErrors({})
    if (onCancel) onCancel()
  }

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
          {isEditing ? (
            <Edit3 className="w-5 h-5 text-primary-600" />
          ) : (
            <Plus className="w-5 h-5 text-primary-600" />
          )}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-secondary-800">
            {isEditing ? 'Edit Job' : 'Create New Job'}
          </h2>
          <p className="text-sm text-secondary-500">
            {isEditing ? 'Update job details below' : 'Fill in the details to add a new job'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Job Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-secondary-700 mb-2">
            Job Title <span className="text-danger-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Senior Software Engineer"
            className={`input-modern ${errors.title ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20' : ''}`}
            disabled={isSubmitting}
          />
          {errors.title && (
            <p className="mt-1.5 text-sm text-danger-500 flex items-center gap-1">
              <span>⚠</span> {errors.title}
            </p>
          )}
        </div>

        {/* Salary */}
        <div>
          <label htmlFor="salary" className="block text-sm font-medium text-secondary-700 mb-2">
            Salary ($) <span className="text-danger-500">*</span>
          </label>
          <input
            type="number"
            id="salary"
            name="salary"
            value={formData.salary}
            onChange={handleChange}
            placeholder="e.g. 120000"
            min="0"
            step="1000"
            className={`input-modern ${errors.salary ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20' : ''}`}
            disabled={isSubmitting}
          />
          {errors.salary && (
            <p className="mt-1.5 text-sm text-danger-500 flex items-center gap-1">
              <span>⚠</span> {errors.salary}
            </p>
          )}
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-secondary-700 mb-2">
            Location <span className="text-danger-500">*</span>
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g. San Francisco, CA"
            className={`input-modern ${errors.location ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20' : ''}`}
            disabled={isSubmitting}
          />
          {errors.location && (
            <p className="mt-1.5 text-sm text-danger-500 flex items-center gap-1">
              <span>⚠</span> {errors.location}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary flex items-center gap-2 min-w-[140px] justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isEditing ? 'Updating...' : 'Creating...'}</span>
              </>
            ) : (
              <>
                {isEditing ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{isEditing ? 'Update Job' : 'Create Job'}</span>
              </>
            )}
          </button>

          {isEditing && onCancel && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="btn-secondary"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default JobForm