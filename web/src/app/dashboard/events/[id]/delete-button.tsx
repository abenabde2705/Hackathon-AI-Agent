'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteEvent } from '../actions'

export function DeleteEventButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible.')) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteEvent(id)
    } catch (error) {
      alert('Une erreur est survenue lors de la suppression.')
      setIsDeleting(false)
    }
  }

  return (
    <Button 
      variant="destructive" 
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4 mr-2" />
      )}
      <span>Supprimer</span>
    </Button>
  )
}
