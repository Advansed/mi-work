// src/components/Acts/ActPrescript/types.ts

// === ИНТЕРФЕЙС ФОРМЫ ПРЕДПИСАНИЯ ===
export interface IPrescriptionForm {
  id?: string;
  invoice_id?: string;
  prescription_number?: string;
  prescription_date: string;
  check_address: string;
  account_number: string;
  subscriber_name: string;
  subscriber_phone: string;
  violations_text: string;
  deadline_date: string;
  organization_representative: string;
  subscriber_signature: string;
  subscriber_representative: string;
  violation_type: string;
  status: string;
  document_scan_path: string;
}

// === СХЕМА ВАЛИДАЦИИ ===
export const prescriptionValidationSchema = {
  prescription_date: {
    required: true,
    message: 'Дата предписания обязательна'
  },
  check_address: {
    required: true,
    message: 'Адрес проверки обязателен'
  },
  subscriber_name: {
    required: true,
    message: 'ФИО абонента обязательно'
  },
  violations_text: {
    required: true,
    message: 'Описание нарушений обязательно'
  },
  deadline_date: {
    required: true,
    message: 'Срок устранения обязателен'
  }
};

// === НАЧАЛЬНЫЕ ДАННЫЕ ===
export const initialPrescriptionData: IPrescriptionForm = {
  id: '',
  prescription_date: new Date().toISOString().split('T')[0],
  check_address: '',
  account_number: '',
  subscriber_name: '',
  subscriber_phone: '',
  violations_text: '',
  deadline_date: '',
  organization_representative: '',
  subscriber_signature: '',
  subscriber_representative: '',
  violation_type: '',
  status: 'created',
  document_scan_path: ''
};