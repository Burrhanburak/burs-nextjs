"use client"

import { useState, useEffect, useMemo } from "react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Search, Download, User, Settings, FileText, Home } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getAuditLogs } from "@/lib/server-actions"
import { toast } from "sonner"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"

// Function to render action badge with appropriate color
function ActionBadge({ action }: { action: string }) {
  switch (action) {
    case "login":
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Giriş</Badge>
    case "update":
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Güncelleme</Badge>
    case "create":
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Oluşturma</Badge>
    case "delete":
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Silme</Badge>
    case "backup":
      return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Yedek</Badge>
    default:
      return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">{action}</Badge>
  }
}

// Function to render action icon
function ActionIcon({ action }: { action: string }) {
  switch (action) {
    case "login":
      return <User className="h-4 w-4 text-blue-500" />
    case "update":
      return <Settings className="h-4 w-4 text-amber-500" />
    case "create":
      return <FileText className="h-4 w-4 text-green-500" />
    case "delete":
      return <FileText className="h-4 w-4 text-red-500" />
    case "backup":
      return <Download className="h-4 w-4 text-purple-500" />
    default:
      return <FileText className="h-4 w-4 text-gray-500" />
  }
}

// Denetim kaydı tipi
interface AuditLog {
  id: string
  timestamp: string
  user: string
  email: string
  action: string
  details: string
  ipAddress: string
  userAgent?: string
}

export default function AuditPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [actionFilter, setActionFilter] = useState("all")
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [availableActions, setAvailableActions] = useState<string[]>([])
  
  useEffect(() => {
    async function fetchAuditLogs() {
      setLoading(true)
      try {
        const logs = await getAuditLogs()
        console.log("Yüklenen denetim kayıtları:", logs.length)
        
        // Extract unique action types for both filtering and dropdown options
        const uniqueActions = [...new Set(logs.map(log => log.action.toLowerCase()))]
        console.log("Mevcut aksiyon türleri:", uniqueActions)
        setAvailableActions(uniqueActions)
        
        setAuditLogs(logs)
      } catch (error) {
        console.error("Denetim kayıtları yüklenirken hata oluştu:", error)
        toast.error("Denetim kayıtları yüklenirken bir hata oluştu")
      } finally {
        setLoading(false)
      }
    }
    
    fetchAuditLogs()
  }, [])
  
  // Handle action filter change
  const handleActionFilterChange = (value: string) => {
    console.log("Aksiyon filtresi değişti:", value)
    setActionFilter(value)
  }
  
  // Filter audit logs based on search term and action filter - memoized for performance
  const filteredLogs = useMemo(() => {
    console.log("Filtre uygulanıyor, seçilen aksiyon:", actionFilter)
    
    return auditLogs.filter(log => {
      const matchesSearch = searchTerm === "" || 
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
        log.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.id.toLowerCase().includes(searchTerm.toLowerCase())
      
      // Check if action matches (case insensitive)
      const matchesAction = 
        actionFilter === "all" || 
        log.action.toLowerCase() === actionFilter.toLowerCase()
      
      return matchesSearch && matchesAction
    })
  }, [auditLogs, searchTerm, actionFilter])

  // Log filtered results count whenever filters change
  useEffect(() => {
    console.log(`Filtreleme sonucu: ${filteredLogs.length} kayıt bulundu`)
  }, [filteredLogs])
  
  // Define table columns
  const columns = useMemo<ColumnDef<AuditLog>[]>(
    () => [
      {
        accessorKey: "timestamp",
        header: "Tarih/Saat",
        cell: ({ row }) => (
          <div className="font-medium">
            {new Date(row.original.timestamp).toLocaleString('tr-TR')}
          </div>
        ),
      },
      {
        accessorKey: "user",
        header: "Kullanıcı",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span>{row.original.user}</span>
            <span className="text-xs text-muted-foreground">{row.original.email}</span>
          </div>
        ),
      },
      {
        accessorKey: "action",
        header: "İşlem",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <ActionIcon action={row.original.action} />
            <ActionBadge action={row.original.action} />
          </div>
        ),
      },
      {
        accessorKey: "details",
        header: "Detay",
        cell: ({ row }) => (
          <div className="max-w-md truncate">{row.original.details}</div>
        ),
      },
      {
        accessorKey: "ipAddress",
        header: "IP Adresi",
        cell: ({ row }) => <div>{row.original.ipAddress}</div>,
      },
    ],
    []
  )

  // Initialize the table
  const table = useReactTable({
    data: filteredLogs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // Add initial state for better performance with large datasets
    initialState: {
      pagination: {
        pageSize: 100, // Show reasonable number of rows at once
      },
    },
    // Disable expensive features when not needed
    enableRowSelection: false,
    enableColumnFilters: false,
    enableGlobalFilter: false,
    enableSorting: false,
  })
  
  // Verileri CSV olarak indir
  const downloadCSV = () => {
    // CSV başlıklarını hazırla
    const headers = ["ID", "Tarih/Saat", "Kullanıcı", "E-posta", "İşlem", "Detay", "IP Adresi"];
    
    // Veri satırlarını hazırla
    const rows = filteredLogs.map(log => [
      log.id,
      new Date(log.timestamp).toLocaleString('tr-TR'),
      log.user,
      log.email,
      log.action,
      log.details,
      log.ipAddress
    ]);
    
    // CSV formatına dönüştür
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Dosyayı indir
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `denetim-kayitlari-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Denetim kayıtları CSV olarak indirildi");
  };
  
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold tracking-tight">Denetim Kayıtları</h1>
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <Home className="h-4 w-4" />
            <span>Ana Sayfaya Dön</span>
          </Link>
        </div>
        <p className="text-muted-foreground">Sistemdeki tüm kullanıcı ve sistem işlemlerinin kayıtları.</p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Kullanıcı, e-posta veya detay ile ara..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select 
          value={actionFilter} 
          onValueChange={handleActionFilterChange}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="İşlem türü" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm İşlemler</SelectItem>
            <SelectItem value="login">Giriş</SelectItem>
            <SelectItem value="update">Güncelleme</SelectItem>
            <SelectItem value="create">Oluşturma</SelectItem>
            <SelectItem value="delete">Silme</SelectItem>
            <SelectItem value="backup">Yedek</SelectItem>
            {/* Add additional actions found in the data but not in our predefined list */}
            {availableActions
              .filter(action => !["login", "update", "create", "delete", "backup"].includes(action))
              .map(action => (
                <SelectItem key={action} value={action}>
                  {action.charAt(0).toUpperCase() + action.slice(1)}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={downloadCSV}
        >
          <Download className="h-4 w-4" />
          CSV İndir
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Sistem Kayıtları</CardTitle>
          <CardDescription>
            Son 30 günün kayıtları gösterilmektedir.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="flex flex-col items-center space-y-2">
                <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-indigo-600"></div>
                <p className="text-sm text-muted-foreground">Kayıtlar yükleniyor...</p>
              </div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="rounded-full bg-muted p-3">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-medium">Kayıt Bulunamadı</h3>
              <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
                Bu filtreleme kriterlerine uygun denetim kaydı bulunmamaktadır.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader className="sticky top-0 bg-white z-10">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center"
                        >
                          Veri bulunamadı
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
