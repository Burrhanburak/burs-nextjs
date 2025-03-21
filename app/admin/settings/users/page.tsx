"use client"

import { useState, useEffect } from "react"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { 
  Search, 
  UserPlus, 
  MoreHorizontal, 
  Shield, 
  UserCog, 
  Mail, 
  CheckCircle,
  XCircle,
  UserX,
  Loader2,
  Copy,
  Trash
} from "lucide-react"
import { getUsers, createUser, deleteUser, editUser } from "@/lib/server-actions"
import { UserRole } from "@prisma/client"
import { toast } from "sonner"

// Kullanıcı tipi
interface User {
  id: string
  name: string
  email: string
  role: UserRole
  status: string
  lastActive: string
  createdAt: string
  password?: string
}

// Kullanıcı durumu badge bileşeni
function UserStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "active":
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Aktif</Badge>
    case "inactive":
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Pasif</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

// Kullanıcı rolü badge bileşeni
function UserRoleBadge({ role }: { role: UserRole }) {
  switch (role) {
    case "ADMIN":
      return (
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1">
          <Shield className="h-3 w-3" />
          Yönetici
        </Badge>
      )
    case "APPLICANT":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
          <UserCog className="h-3 w-3" />
          Başvuran
        </Badge>
      )
    default:
      return <Badge variant="outline">{role}</Badge>
  }
}

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newUserInfo, setNewUserInfo] = useState<User | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [userToEdit, setUserToEdit] = useState<User | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    tcKimlikNo: "",
    phone: "",
    role: "APPLICANT" as UserRole
  })
  
  // Düzenleme formu
  const [editFormData, setEditFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    tcKimlikNo: "",
    phone: "",
    role: "" as UserRole
  })
  
  // Form değişikliklerini işle
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    })
  }
  
  // Role seçimini işle
  const handleRoleChange = (value: string) => {
    setFormData({
      ...formData,
      role: value as UserRole
    })
  }
  
  // Formu temizle
  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      tcKimlikNo: "",
      phone: "",
      role: "APPLICANT"
    })
  }
  
  useEffect(() => {
    async function fetchUsers() {
      setLoading(true)
      try {
        const data = await getUsers()
        setUsers(data)
      } catch (error) {
        console.error("Kullanıcılar yüklenirken hata oluştu:", error)
        toast.error("Kullanıcılar yüklenirken bir hata oluştu")
      } finally {
        setLoading(false)
      }
    }
    
    fetchUsers()
  }, [])
  
  // Kullanıcıları filtreleme
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    
    return matchesSearch && matchesRole && matchesStatus
  })
  
  // Yeni kullanıcı ekle
  const handleAddUser = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.tcKimlikNo || !formData.phone) {
      toast.error("Lütfen tüm zorunlu alanları doldurun")
      return
    }
    
    setIsSubmitting(true)
    
    try {
      console.log("Kullanıcı ekleme işlemi başlatılıyor...", formData);
      const newUser = await createUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        tcKimlikNo: formData.tcKimlikNo,
        mobilePhone: formData.phone,
        role: formData.role
      })
      
      console.log("Kullanıcı başarıyla eklendi:", newUser);
      
      // Mevcut listeye ekleyerek UI'ı güncelle
      setUsers(prevUsers => [newUser, ...prevUsers])
      
      // Geçici şifreyi göstermek için newUserInfo'yu ayarla
      setNewUserInfo(newUser)
      
      // Formu kapat ve temizle
      setIsAddUserOpen(false)
      resetForm()
      
      // Başarı bildirimi göster
      toast.success(`${newUser.name} kullanıcısı eklendi`)
    } catch (error) {
      console.error("Kullanıcı ekleme hatası:", error);
      const errorMessage = error instanceof Error ? error.message : "Kullanıcı eklenirken bir hata oluştu"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Şifreyi kopyala
  const copyPassword = (password: string) => {
    navigator.clipboard.writeText(password)
    toast.success('Şifre panoya kopyalandı')
  }
  
  // Kullanıcı düzenleme modalını aç
  const handleEditUser = (user: User) => {
    setUserToEdit(user)
    // Kullanıcı adı ve soyadını ayır
    const nameParts = user.name.split(' ')
    const firstName = nameParts[0] || ""
    const lastName = nameParts.slice(1).join(' ') || ""
    
    setEditFormData({
      firstName,
      lastName,
      email: user.email,
      tcKimlikNo: "", // API'den alınmalı
      phone: "", // API'den alınmalı
      role: user.role
    })
    
    setIsEditUserOpen(true)
  }
  
  // Düzenleme form değişikliklerini işle
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditFormData({
      ...editFormData,
      [e.target.id]: e.target.value
    })
  }
  
  // Edit formundaki rol değişikliği
  const handleEditRoleChange = (value: string) => {
    setEditFormData({
      ...editFormData,
      role: value as UserRole
    })
  }
  
  // Kullanıcı bilgilerini güncelle
  const updateUser = async () => {
    if (!userToEdit) return
    
    setIsSubmitting(true)
    
    try {
      const updatedUser = await editUser(userToEdit.id, {
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        email: editFormData.email,
        tcKimlikNo: editFormData.tcKimlikNo || undefined,
        mobilePhone: editFormData.phone || undefined,
        role: editFormData.role,
      })
      
      // UI'daki kullanıcı listesini güncelle
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userToEdit.id ? updatedUser : u
        )
      )
      
      setIsEditUserOpen(false)
      toast.success(`${updatedUser.name} kullanıcısı güncellendi`)
    } catch (error) {
      console.error("Kullanıcı güncelleme hatası:", error);
      const errorMessage = error instanceof Error ? error.message : "Kullanıcı güncellenirken bir hata oluştu"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Kullanıcı silme işlemi için onay iste
  const handleDeleteUser = (userId: string) => {
    setConfirmDelete(userId)
  }
  
  // Kullanıcı silme işlemini onayla
  const confirmDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId)
      
      // UI'daki listeden kullanıcıyı kaldır
      const userToDelete = users.find(u => u.id === userId)
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userId))
      setConfirmDelete(null)
      
      toast.success(`${userToDelete?.name || 'Kullanıcı'} silindi`)
    } catch (error) {
      console.error("Kullanıcı silme hatası:", error);
      const errorMessage = error instanceof Error ? error.message : "Kullanıcı silinirken bir hata oluştu"
      toast.error(errorMessage)
    }
  }
  
  // Kullanıcı rolünü değiştir
  const handleChangeRole = async (user: User) => {
    const newRole = user.role === "ADMIN" ? "APPLICANT" : "ADMIN"
    const roleName = newRole === "ADMIN" ? "Yönetici" : "Başvuran"
    
    try {
      const updatedUser = await editUser(user.id, {
        role: newRole
      })
      
      // UI'daki kullanıcı listesini güncelle
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === user.id ? updatedUser : u
        )
      )
      
      toast.success(`${user.name} artık ${roleName}`)
    } catch (error) {
      console.error("Kullanıcı rolü değiştirme hatası:", error);
      const errorMessage = error instanceof Error ? error.message : "Kullanıcı rolü değiştirilirken bir hata oluştu"
      toast.error(errorMessage)
    }
  }
  
  // Kullanıcı durumunu değiştir (aktif/pasif)
  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === "active" ? false : true // isActive değeri
    const message = newStatus ? "aktifleştirildi" : "devre dışı bırakıldı"
    
    try {
      const updatedUser = await editUser(user.id, {
        isActive: newStatus
      })
      
      // UI'daki kullanıcı listesini güncelle
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === user.id ? updatedUser : u
        )
      )
      
      toast.success(`${user.name} ${message}`)
    } catch (error) {
      console.error("Kullanıcı durumu değiştirme hatası:", error);
      const errorMessage = error instanceof Error ? error.message : "Kullanıcı durumu değiştirilirken bir hata oluştu"
      toast.error(errorMessage)
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Yeni kullanıcı şifre dialog */}
      {newUserInfo && newUserInfo.password && (
        <Dialog open={Boolean(newUserInfo)} onOpenChange={() => setNewUserInfo(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Kullanıcı Eklendi</DialogTitle>
              <DialogDescription>
                Kullanıcı başarıyla oluşturuldu. Aşağıdaki geçici şifreyi kullanıcıya iletmeyi unutmayın.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div>
                <Label>Kullanıcı</Label>
                <div className="font-medium">{newUserInfo.name}</div>
              </div>
              
              <div>
                <Label>E-posta</Label>
                <div className="font-medium">{newUserInfo.email}</div>
              </div>
              
              <div>
                <Label className="mb-2 block">Geçici Şifre</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted p-2 rounded font-mono">{newUserInfo.password}</div>
                  <Button 
                    size="icon"
                    variant="outline"
                    onClick={() => copyPassword(newUserInfo.password || '')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button onClick={() => setNewUserInfo(null)}>Tamam</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Kullanıcı silme onayı dialog */}
      {confirmDelete && (
        <Dialog open={Boolean(confirmDelete)} onOpenChange={() => setConfirmDelete(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Kullanıcı Silme Onayı</DialogTitle>
              <DialogDescription>
                Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
              </DialogDescription>
            </DialogHeader>
            
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setConfirmDelete(null)}>
                İptal
              </Button>
              <Button variant="destructive" onClick={() => confirmDeleteUser(confirmDelete)}>
                <Trash className="mr-2 h-4 w-4" />
                Kullanıcıyı Sil
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kullanıcı Yönetimi</h1>
          <p className="text-muted-foreground">Sistem kullanıcılarını yönetin ve izinleri düzenleyin.</p>
        </div>
        <Button onClick={() => setIsAddUserOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Kullanıcı Ekle
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="İsim veya e-posta ile ara..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Rol Filtrele" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Roller</SelectItem>
            <SelectItem value="ADMIN">Yönetici</SelectItem>
            <SelectItem value="APPLICANT">Başvuran</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Durum Filtrele" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Durumlar</SelectItem>
            <SelectItem value="active">Aktif</SelectItem>
            <SelectItem value="inactive">Pasif</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Kullanıcılar</CardTitle>
          <CardDescription>
            Sistemde kayıtlı {users.length} kullanıcı bulunmaktadır.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="flex flex-col items-center space-y-2">
                <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-indigo-600"></div>
                <p className="text-sm text-muted-foreground">Kullanıcılar yükleniyor...</p>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="rounded-full bg-muted p-3">
                <UserX className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-medium">Kullanıcı Bulunamadı</h3>
              <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
                Bu filtreleme kriterlerine uygun kullanıcı bulunmamaktadır.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kullanıcı</TableHead>
                  <TableHead>E-Posta</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Son Aktivite</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="font-medium">{user.name}</div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <UserRoleBadge role={user.role} />
                    </TableCell>
                    <TableCell>
                      <UserStatusBadge status={user.status} />
                    </TableCell>
                    <TableCell>{new Date(user.lastActive).toLocaleString('tr-TR')}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Menüyü aç</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEditUser(user)}>
                            <UserCog className="mr-2 h-4 w-4" />
                            Düzenle
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.info('E-posta gönderme yakında eklenecek')}>
                            <Mail className="mr-2 h-4 w-4" />
                            E-posta Gönder
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleChangeRole(user)}>
                            <Shield className="mr-2 h-4 w-4" />
                            {user.role === "APPLICANT" ? "Yönetici Yap" : "Başvuran Yap"}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleToggleStatus(user)}
                            className={user.status === "active" ? "text-red-600" : "text-green-600"}
                          >
                            {user.status === "active" ? (
                              <>
                                <XCircle className="mr-2 h-4 w-4" />
                                Devre Dışı Bırak
                              </>
                            ) : (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Aktifleştir
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Sil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Kullanıcı Ekleme Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Yeni Kullanıcı Ekle</DialogTitle>
            <DialogDescription>
              Sisteme yeni bir kullanıcı eklemek için gerekli bilgileri doldurun.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Ad</Label>
                <Input 
                  id="firstName" 
                  placeholder="Adı"
                  value={formData.firstName}
                  onChange={handleFormChange} 
                />
              </div>
              <div>
                <Label htmlFor="lastName">Soyad</Label>
                <Input 
                  id="lastName" 
                  placeholder="Soyadı"
                  value={formData.lastName}
                  onChange={handleFormChange}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="email">E-posta</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="ornek@email.com"
                value={formData.email}
                onChange={handleFormChange}
              />
            </div>
            
            <div>
              <Label htmlFor="tcKimlikNo">TC Kimlik No</Label>
              <Input 
                id="tcKimlikNo" 
                placeholder="11 haneli TC kimlik numarası"
                value={formData.tcKimlikNo}
                onChange={handleFormChange}
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Telefon</Label>
              <Input 
                id="phone" 
                placeholder="05XX XXX XX XX"
                value={formData.phone}
                onChange={handleFormChange}
              />
            </div>
            
            <div>
              <Label htmlFor="role">Kullanıcı Rolü</Label>
              <Select 
                value={formData.role} 
                onValueChange={handleRoleChange}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Rol seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Yönetici</SelectItem>
                  <SelectItem value="APPLICANT">Başvuran</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                resetForm()
                setIsAddUserOpen(false)
              }}
            >
              İptal
            </Button>
            <Button 
              type="button" 
              onClick={handleAddUser}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  İşleniyor...
                </>
              ) : (
                "Kullanıcı Ekle"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Kullanıcı Düzenleme Dialog */}
      {userToEdit && (
        <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Kullanıcı Düzenle</DialogTitle>
              <DialogDescription>
                {userToEdit.name} adlı kullanıcının bilgilerini düzenleyin.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Ad</Label>
                  <Input 
                    id="firstName" 
                    placeholder="Adı"
                    value={editFormData.firstName}
                    onChange={handleEditFormChange} 
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Soyad</Label>
                  <Input 
                    id="lastName" 
                    placeholder="Soyadı"
                    value={editFormData.lastName}
                    onChange={handleEditFormChange}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">E-posta</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="ornek@email.com"
                  value={editFormData.email}
                  onChange={handleEditFormChange}
                />
              </div>
              
              <div>
                <Label htmlFor="role">Kullanıcı Rolü</Label>
                <Select 
                  value={editFormData.role} 
                  onValueChange={handleEditRoleChange}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Rol seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Yönetici</SelectItem>
                    <SelectItem value="APPLICANT">Başvuran</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsEditUserOpen(false)}
              >
                İptal
              </Button>
              <Button 
                type="button" 
                onClick={updateUser}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Güncelleniyor...
                  </>
                ) : (
                  "Değişiklikleri Kaydet"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
