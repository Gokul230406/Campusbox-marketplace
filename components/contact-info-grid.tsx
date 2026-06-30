import { Building2, GraduationCap, Hash, Mail, Phone, User } from "lucide-react"

export type ContactDetails = {
  fullName?: string
  firstName?: string
  lastName?: string
  email?: string
  phoneNumber?: string
  altPhoneNumber?: string
  registerNumber?: string
  department?: string
  year?: string
  section?: string
  collegeName?: string
}

function displayName(details: ContactDetails) {
  if (details.fullName?.trim()) return details.fullName.trim()
  return `${details.firstName || ""} ${details.lastName || ""}`.trim() || "—"
}

type ContactInfoGridProps = {
  details: ContactDetails
  showEmpty?: boolean
}

export function ContactInfoGrid({ details, showEmpty = false }: ContactInfoGridProps) {
  const rows = [
    { icon: User, label: "Full Name", value: displayName(details) },
    { icon: Mail, label: "Email", value: details.email },
    { icon: Phone, label: "Phone", value: details.phoneNumber ? `+91 ${details.phoneNumber}` : "" },
    { icon: Phone, label: "Alternate Phone", value: details.altPhoneNumber ? `+91 ${details.altPhoneNumber}` : "" },
    { icon: Hash, label: "Register No.", value: details.registerNumber },
    { icon: GraduationCap, label: "Department", value: details.department },
    { icon: GraduationCap, label: "Year", value: details.year },
    { icon: GraduationCap, label: "Section", value: details.section },
    { icon: Building2, label: "College", value: details.collegeName },
  ].filter((row) => showEmpty || row.value)

  if (rows.length === 0) {
    return <p className="text-sm text-[var(--app-muted)]">No contact details available.</p>
  }

  return (
    <div className="app-contact-grid">
      {rows.map((row) => (
        <div key={row.label} className="app-contact-item">
          <div className="app-contact-item-icon">
            <row.icon className="h-4 w-4" />
          </div>
          <div className="app-contact-item-body">
            <p className="app-contact-item-label">{row.label}</p>
            <p className="app-contact-item-value">{row.value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
