'use client'

import { useState } from 'react'
import { bulkInviteAlumni } from '@/lib/services/user-actions'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Upload, ArrowLeft, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

interface CSVRow {
  email: string
  first_name: string
  last_name: string
  graduation_year?: string
  degree?: string
  linkedin_url?: string
  [key: string]: string | undefined
}

export default function ImportPage() {
  const [data, setData] = useState<CSVRow[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<{ successCount: number; errors: string[] } | null>(null)

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n')
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      
      const parsedData = lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
          const values = line.split(',').map(v => v.trim())
          const row: CSVRow = {
            email: '',
            first_name: '',
            last_name: '',
          }
          headers.forEach((header, index) => {
            row[header] = values[index]
          })
          return row
        })
      
      setData(parsedData)
    }
    reader.readAsText(file)
  }

  async function handleImport() {
    setIsProcessing(true)
    const res = await bulkInviteAlumni(data)
    setResults(res)
    setIsProcessing(false)
  }

  if (results) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="p-8 text-center space-y-4">
          <div className="flex justify-center">
            {results.errors.length === 0 ? (
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            ) : (
              <AlertTriangle className="h-16 w-16 text-yellow-500" />
            )}
          </div>
          <h2 className="text-2xl font-bold">Importation Terminée</h2>
          <p className="text-muted-foreground">
            {results.successCount} utilisateurs ont été invités avec succès.
          </p>
          
          {results.errors.length > 0 && (
            <div className="text-left mt-6 space-y-2">
              <p className="text-sm font-semibold text-destructive">Erreurs ({results.errors.length}) :</p>
              <ul className="text-sm text-destructive list-disc list-inside bg-destructive/5 p-4 rounded-lg">
                {results.errors.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            </div>
          )}

          <div className="pt-6">
            <Button asChild className="w-full">
              <Link href="/dashboard">Retour à la gestion des utilisateurs</Link>
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Importer des Alumni</h2>
      </div>

      {!data.length ? (
        <Card className="p-12 border-dashed border-2 flex flex-col items-center justify-center space-y-4">
          <Upload className="h-12 w-12 text-muted-foreground" />
          <div className="text-center">
            <p className="text-lg font-medium">Sélectionnez votre fichier CSV</p>
            <p className="text-sm text-muted-foreground">
              Format requis: first_name, last_name, email, graduation_year, degree, linkedin_url
            </p>
          </div>
          <Input 
            type="file" 
            accept=".csv" 
            onChange={handleFileUpload} 
            className="max-w-xs cursor-pointer"
          />
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="p-4 bg-muted/50 flex items-center justify-between border-b">
              <span className="text-sm font-medium">{data.length} lignes détectées</span>
              <Button variant="ghost" size="sm" onClick={() => setData([])}>
                Annuler
              </Button>
            </div>
            <div className="max-h-[400px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Prénom</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Promo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.slice(0, 10).map((row, i) => (
                    <TableRow key={i}>
                      <TableCell>{row.email}</TableCell>
                      <TableCell>{row.first_name}</TableCell>
                      <TableCell>{row.last_name}</TableCell>
                      <TableCell>{row.graduation_year}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {data.length > 10 && (
                <div className="p-4 text-center text-xs text-muted-foreground border-t">
                  Et {data.length - 10} autres lignes...
                </div>
              )}
            </div>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => setData([])} disabled={isProcessing}>
              Réinitialiser
            </Button>
            <Button onClick={handleImport} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importation en cours...
                </>
              ) : (
                `Lancer l'importation (${data.length} utilisateurs)`
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
