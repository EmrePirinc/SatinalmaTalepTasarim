import { useState, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { Search } from "lucide-react"

export type UserOption = {
  sapId: string
  name: string
  username: string
}

// Örnek kullanıcılar
const mockUsers: UserOption[] = [
  { sapId: "SAP001", name: "Ahmet Yılmaz", username: "ahmet.yilmaz@hzlm.com" },
  { sapId: "SAP002", name: "Ayşe Demir", username: "ayse.demir@hzlm.com" },
  { sapId: "SAP003", name: "Mehmet Kaya", username: "mehmet.kaya@hzlm.com" },
  { sapId: "SAP004", name: "Fatma Şahin", username: "fatma.sahin@hzlm.com" },
  { sapId: "SAP005", name: "Ali Çelik", username: "ali.celik@hzlm.com" },
  { sapId: "SAP006", name: "Zeynep Arslan", username: "zeynep.arslan@hzlm.com" },
  { sapId: "SAP007", name: "Mustafa Özdemir", username: "mustafa.ozdemir@hzlm.com" },
  { sapId: "SAP008", name: "Elif Yıldız", username: "elif.yildiz@hzlm.com" },
  { sapId: "SAP009", name: "Can Aydın", username: "can.aydin@hzlm.com" },
  { sapId: "SAP010", name: "Selin Koç", username: "selin.koc@hzlm.com" },
  { sapId: "SAP011", name: "Burak Türk", username: "burak.turk@hzlm.com" },
  { sapId: "SAP012", name: "Deniz Aksoy", username: "deniz.aksoy@hzlm.com" },
  { sapId: "SAP013", name: "Ece Yurt", username: "ece.yurt@hzlm.com" },
  { sapId: "SAP014", name: "Emre Güneş", username: "emre.gunes@hzlm.com" },
  { sapId: "SAP015", name: "Gizem Polat", username: "gizem.polat@hzlm.com" },
]

interface UserSelectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUserSelected: (user: UserOption) => void
}

export default function UserSelectionDialog({ open, onOpenChange, onUserSelected }: UserSelectionDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredUsers = useMemo(() => {
    return mockUsers.filter(
      (user) =>
        user.sapId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  const handleSelect = (user: UserOption) => {
    onUserSelected(user)
    onOpenChange(false)
    setSearchQuery("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-[900px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Kullanıcı Seçimi</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Input
            placeholder="SAP ID, ad soyad veya kullanıcı adına göre ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex-1 overflow-auto border rounded-md">
          <Table>
            <TableHeader className="sticky top-0 bg-muted">
              <TableRow>
                <TableHead className="w-[150px]">SAP ID</TableHead>
                <TableHead className="w-[250px]">Ad Soyad</TableHead>
                <TableHead>Kullanıcı Adı</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.sapId} onClick={() => handleSelect(user)} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">{user.sapId}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{user.username}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Kapat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
