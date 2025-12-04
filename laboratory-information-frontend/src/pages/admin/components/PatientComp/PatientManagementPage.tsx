import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/common/card';
import { Users, Search, Eye, Edit, Trash2, Phone, Mail, MapPin, Heart, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../components/common/button';
import { Input } from '../../../../components/common/input';
import type { Patient } from '@/pages/labuser/types/Patient';
import { deletePatient as deletePatientApi, updatePatient as updatePatientApi, fetchPatients } from '../../../../service/patientService';
import { patientMedicalRecordService, type PatientMedicalRecord } from '../../../../service/patientMedicalRecordService';
import { usePatientModal } from '../../hooks/usePatientModal';
import { Patient_UpdateModal } from './PatientUpdateModal';
import { Patient_DeleteModal } from './PatientDeleteModal';
import { toast } from 'sonner';
import { Skeleton } from '@/components/common/skeleton';
import { useAuthContext } from '../../../../hooks/useAuthContext';
import AddPatientMedicalRecord from '@/pages/labuser/components/modals/PatientMedicalRecordModal/PatientMedicalRecordAddModal';
import { useTranslation } from 'react-i18next';

export function AdminPatientManagementPage() {
  const { user } = useAuthContext();
  const isLabUser = Array.isArray(user?.role) ? user!.role.includes('LAB_USER') : user?.role === 'LAB_USER';
  const [patients, setPatients] = useState<Patient[]>([]);
  const [page, setPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name?: string } | null>(null);
  const [mrCreateOpen, setMrCreateOpen] = useState(false);
  // Fetch all patients for comprehensive filtering (use patientService directly)
  const [loading, setLoading] = useState<boolean>(true);

  const { modalState, openEditModal, closeModal } = usePatientModal();
  const navigate = useNavigate();
  const { t } = useTranslation();
  // render pagination controls
  const renderPagination = () => (
    <div className="flex justify-center items-center gap-1 sm:gap-2 mt-4 overflow-x-auto pb-2">
      <button
        className="px-2 sm:px-3 py-1 sm:py-2 rounded border disabled:opacity-50 text-xs sm:text-sm flex-shrink-0"
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        disabled={page === 1}
        aria-label="Trang trước"
      >
        <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
      </button>
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i + 1}
          className={`px-2 sm:px-3 py-1 sm:py-2 rounded border text-xs sm:text-sm flex-shrink-0 ${page === i + 1 ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'}`}
          onClick={() => setPage(i + 1)}
        >
          {i + 1}
        </button>
      ))}
      <button
        className="px-2 sm:px-3 py-1 sm:py-2 rounded border disabled:opacity-50 text-xs sm:text-sm flex-shrink-0"
        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        disabled={page === totalPages}
        aria-label="Trang sau"
      >
        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
      </button>
    </div>
  );

  // Filter and paginate from all patients
  const { filteredPatients, totalPages } = useMemo(() => {
    // First, filter all patients based on search and status
    const filtered = patients.filter(patient => {
      const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.identifyNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || patient.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });

    // Then paginate the filtered results
    const pageSize = 10;
    const totalPages = Math.ceil(filtered.length / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedResults = filtered.slice(startIndex, endIndex);

    return {
      filteredPatients: paginatedResults,
      totalPages: Math.max(1, totalPages)
    };
  }, [patients, searchTerm, selectedStatus, page]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return t('patient.active');
      case 'inactive': return t('patient.inactive');
      default: return status;
    }
  };

  // Return color classes for blood type badge (kept simple)
  const getBloodTypeColor = () => {
    // You can adjust colors per bloodType if needed
    return 'bg-blue-100 text-blue-800';
  };


  useEffect(() => {
    let mounted = true;

    // Transform all patients from backend format to frontend Patient type
    const transformPatients = async () => {
      // hold mapped in outer scope so enrichment can access it
      let mapped: Patient[] = [];
      try {
        setLoading(true);
        const res = await fetchPatients(1, 1000);
        const backendList = res?.patients ?? [];

        if (!backendList.length) {
          if (mounted) setPatients([]);
          return;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mapped = backendList.map((b: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const bb: any = b;
        const user = bb.user ?? {};
        const getFrom = (key: string) => user[key] ?? bb[key] ?? bb[key.replace(/([A-Z])/g, '_$1').toLowerCase()];
        const rawGender = String(getFrom('gender') || 'male').toLowerCase();
        const gender = rawGender === 'female' ? 'female' : rawGender === 'other' ? 'other' : 'male';
        const bloodTypeRaw = String(getFrom('bloodType') || '');
        const bloodType = bloodTypeRaw || '';

        const id = String(bb._id ?? bb.id ?? bb.patientId ?? '');
        const name = String(user.fullName ?? user.name ?? bb.fullName ?? bb.name ?? '');
        const email = String(user.email ?? bb.email ?? '');
        const phone = String(user.phoneNumber ?? user.phone ?? bb.phone ?? '');
        const identifyNumber = String(user.identityNumber ?? user.identifyNumber ?? bb.identityNumber ?? '');
        const dateOfBirth = String(user.dateOfBirth ?? bb.dateOfBirth ?? bb.date_of_birth ?? '');
        const age = Number(user.age ?? bb.age ?? 0);
        const address = String(user.address ?? bb.address ?? '');
        const emergencyObj = (bb.emergency_contact ?? bb.emergencyContact ?? {}) as Record<string, unknown>;
        const medicalHistory = Array.isArray(bb.medicalHistory) ? bb.medicalHistory as string[] : (bb.medicalHistory ? [String(bb.medicalHistory)] : []);
        const allergies = Array.isArray(bb.allergies) ? bb.allergies as string[] : [];
        const status = String(bb.is_active === false ? 'inactive' : (bb.status ?? 'active'));
        const createdAt = String(bb.created_at ?? bb.createdAt ?? '');
        const updatedAt = String(bb.updated_at ?? bb.updatedAt ?? '');
        const lastVisit = String(bb.last_visit_date ?? bb.lastVisit ?? '');

        return {
          id,
          name,
          email,
          phone,
          identifyNumber,
          gender,
          dateOfBirth,
          age,
          address,
          avatar: String(user.avatar ?? bb.avatar ?? ''),
          emergencyContact: { name: String(emergencyObj['name'] ?? ''), phone: String(emergencyObj['phone'] ?? ''), relationship: String(emergencyObj['relationship'] ?? '') },
          medicalHistory,
          allergies,
          bloodType,
          status: status as Patient['status'],
          createdAt,
          updatedAt,
          lastVisit,
        } as Patient;
      });

        if (mounted) setPatients(mapped);
      } catch (err) {
        console.error('Error fetching patients for admin page', err);
        if (mounted) setPatients([]);
      } finally {
        if (mounted) setLoading(false);
      }

      // Enrich bloodType from latest medical record per patient
      try {
        const bloodTypeUpdates: Record<string, string> = {};
        await Promise.all(mapped.map(async (p) => {
          if (!p.id) return;
          try {
            const res = await patientMedicalRecordService.getAll({ page: 1, limit: 20, patientId: p.id });
            const records: PatientMedicalRecord[] = (res.records || []).filter(r => r.patient_id === p.id);
            if (records.length) {
              records.sort((a, b) => new Date(b.updated_at || b.created_at || 0).getTime() - new Date(a.updated_at || a.created_at || 0).getTime());
              const latest = records[0];
              if (latest.blood_type) bloodTypeUpdates[p.id] = latest.blood_type;
            }
          } catch {/* ignore per patient */ }
        }));
        if (mounted && Object.keys(bloodTypeUpdates).length) {
          setPatients(prev => prev.map(pt => {
            const newBT = bloodTypeUpdates[pt.id];
            if (!newBT) return pt;
            return { ...pt, bloodType: newBT };
          }));
        }
      } catch {/* ignore global enrich */ }
    };

    transformPatients();
    return () => { mounted = false; };
  }, []);
  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">

      {/* 🔹 Header hiển thị hoặc Skeleton */}
      {loading ? (
        <div className="space-y-1">
          <Skeleton className="h-6 sm:h-8 w-1/2 sm:w-1/4 mb-2" />
          <Skeleton className="h-4 w-3/4 sm:w-1/2" />
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('patient.title')}</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">{t('patient.subtitle')}</p>
          </div>
          <div className="flex space-x-3 w-full sm:w-auto">
            <Button onClick={() => setMrCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto text-sm sm:text-base">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{t('patient.createMedicalRecord')}</span>
              <span className="sm:hidden">Tạo hồ sơ</span>
            </Button>
          </div>
        </div>
      )}

      {/* 🔹 Nếu loading thì hiển thị skeleton table & cards */}
      {loading ? (
        <>
          {/* Skeleton cho thống kê */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                    <Skeleton className="h-10 w-10 rounded-lg" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Skeleton cho bảng */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-16 rounded-md" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">{t('patient.totalPatients')}</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{patients.length}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">{t('patient.activePatients')}</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-600">
                      {patients.filter(p => p.status === 'active').length}
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                    <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder={t('patient.searchPlaceholder')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 text-sm sm:text-base"
                    />
                  </div>
                </div>
                <div className="w-full sm:w-48">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full p-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">{t('patient.allStatus')}</option>
                    <option value="active">{t('patient.activeStatus')}</option>
                    <option value="inactive">{t('patient.inactiveStatus')}</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Patients Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">{t('patient.patientList')} ({filteredPatients.length})</CardTitle>
              <CardDescription className="text-xs sm:text-sm">{t('patient.patientListDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-xs sm:text-sm text-gray-700">{t('patient.patientName')}</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-xs sm:text-sm text-gray-700 hidden md:table-cell">{t('patient.contactInformation')}</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-xs sm:text-sm text-gray-700 hidden lg:table-cell">{t('patient.bloodType')}</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-xs sm:text-sm text-gray-700">{t('patient.status')}</th>
                        <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-semibold text-xs sm:text-sm text-gray-700">{t('patient.action')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPatients.map((patient) => (
                        <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-2 sm:px-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                              {patient.avatar ? (
                                <img
                                  src={patient.avatar}
                                  alt={patient.name}
                                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
                                  onError={(e) => {
                                    // If image fails to load (CORS or broken URL), fall back to initials
                                    const img = e.currentTarget as HTMLImageElement;
                                    img.style.display = 'none';
                                    const parent = img.parentElement;
                                    if (parent) {
                                      const fallback = document.createElement('div');
                                      fallback.className = 'w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white font-semibold text-xs sm:text-sm flex-shrink-0';
                                      fallback.textContent = patient.name?.charAt(0) ?? '';
                                      parent.appendChild(fallback);
                                    }
                                  }}
                                />
                              ) : (
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white font-semibold text-xs sm:text-sm flex-shrink-0">
                                  {patient.name.charAt(0)}
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-sm sm:text-base text-gray-900 truncate">{patient.name}</div>
                                <div className="text-xs sm:text-sm text-gray-500">
                                  {patient.gender === 'male' ? t('patient.male') : patient.gender === 'female' ? t('patient.female') : t('patient.other')} • {patient.age} {t('patient.age')}
                                </div>
                                <div className="md:hidden mt-1 space-y-0.5">
                                  <div className="flex items-center gap-1 text-xs text-gray-600">
                                    <Phone className="h-3 w-3" />
                                    <span className="truncate">{patient.phone}</span>
                                  </div>
                                  {patient.email && (
                                    <div className="flex items-center gap-1 text-xs text-gray-600">
                                      <Mail className="h-3 w-3" />
                                      <span className="truncate">{patient.email}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-2 sm:px-4 hidden md:table-cell">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                                <Phone className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{patient.phone}</span>
                              </div>
                              {patient.email && (
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                                  <Mail className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">{patient.email}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                                <MapPin className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate max-w-32">{patient.address}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-2 sm:px-4 hidden lg:table-cell">
                            {patient.bloodType ? (
                              <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${getBloodTypeColor()}`}>
                                {patient.bloodType}
                              </span>
                            ) : (
                              <span className="text-xs sm:text-sm text-gray-500 italic">{t('patient.noBloodType')}</span>
                            )}
                          </td>
                          <td className="py-3 px-2 sm:px-4">
                            <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                              {getStatusLabel(patient.status)}
                            </span>
                          </td>
                          <td className="py-3 px-2 sm:px-4">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                title={t('patient.viewDetails')}
                                onClick={() => navigate(`${isLabUser ? '/labuser/patients' : '/admin/patient-management'}/${patient.id}`)}
                                className="h-8 w-8 sm:h-10 sm:w-10"
                              >
                                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                title={t('patient.edit')}
                                onClick={() => openEditModal(patient.id)}
                                className="h-8 w-8 sm:h-10 sm:w-10"
                              >
                                <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                title={t('patient.delete')}
                                className="text-red-600 hover:text-red-700 h-8 w-8 sm:h-10 sm:w-10"
                                onClick={() => setDeleteTarget({ id: patient.id, name: patient.name })}
                              >
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
          {renderPagination()}
          {/* Patient modal and delete confirm */}
          <Patient_UpdateModal
            isOpen={modalState.isOpen}
            mode={modalState.mode}
            patient={modalState.patient}
            onClose={closeModal}
            onSubmit={async (data) => {
              // Only update emergency contact fields
              if (!modalState.patient) {
                console.error('Missing patient for update');
                toast.error(t('patient.updateFailed'));
                return;
              }

              const patientId = modalState.patient._id ?? modalState.patient.id;
              if (!patientId) {
                console.error('Missing patient ID for update');
                toast.error(t('patient.updateFailed'));
                return;
              }

              try {
                const d = data as Record<string, unknown>;
                const name = String(d['emergency_name'] ?? '');
                const phone = String(d['emergency_phone'] ?? '');

                const payload = {
                  id: patientId,
                  emergency_contact: { name, phone }
                };

                console.log('Updating patient', { id: patientId, payload });

                // Gọi API cập nhật
                const updated = await updatePatientApi(patientId, payload);

                if (updated) {
                  console.log('Update successful', updated);

                  // Cập nhật danh sách local
                  setPatients((prev) =>
                    prev.map((p) => {
                      if (p.id === patientId) {
                        return {
                          ...p,
                          emergencyContact: {
                            name: payload.emergency_contact.name,
                            phone: payload.emergency_contact.phone,
                            relationship: p.emergencyContact?.relationship ?? ''
                          }
                        };
                      }
                      return p;
                    })
                  );

                  toast.success(t('patient.updateSuccess'));
                  closeModal();
                } else {
                  console.error('Update failed - no response from server');
                  toast.error(t('patient.updateFailed'));
                }
              } catch (err) {
                console.error('Failed to update patient:', err);
                toast.error(t('patient.updateFailed'));
              }
            }}
          />


          <Patient_DeleteModal
            open={Boolean(deleteTarget)}
            itemName={deleteTarget?.name}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={async () => {
              if (!deleteTarget) return;
              const ok = await deletePatientApi(deleteTarget.id);
              if (ok) {
                // remove locally
                setPatients((prev) => prev.filter((p) => p.id !== deleteTarget.id));
              } else {
                console.error('Failed to delete patient', deleteTarget.id);
              }
              setDeleteTarget(null);
            }}
          />
          <AddPatientMedicalRecord
            open={mrCreateOpen}
            onOpenChange={setMrCreateOpen}
            onCreated={(created: PatientMedicalRecord | null | undefined) => {
              if (!created) return;
              setPatients(prev => prev.map(p => p.id === created.patient_id
                ? { ...p, bloodType: created.blood_type || p.bloodType }
                : p));
            }}
          />
        </>
      )}
    </div>
  );
}
