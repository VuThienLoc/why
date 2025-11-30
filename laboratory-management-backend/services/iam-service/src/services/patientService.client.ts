interface CreatePatientRequest {
  user_id: string;
  emergency_contact?: {
    name: string;
    phone: string;
  };
}

interface ActorContext {
  id?: string | null;
  email?: string | null;
}

class PatientServiceClient {
  private baseUrl: string | null = null;
  private internalApiKey: string | null = null;

  private initialize() {
    if (this.baseUrl !== null) {
      return;
    }

    this.baseUrl = process.env.PATIENT_SERVICE_URL || 'http://localhost:5001';
    this.internalApiKey = process.env.INTERNAL_API_KEY || '';

    console.log('[PatientServiceClient] Configured baseUrl:', this.baseUrl);
    console.log('[PatientServiceClient] INTERNAL_API_KEY:', this.internalApiKey ? '***' + this.internalApiKey.slice(-4) : 'NOT SET');
  }

  private buildHeaders(actor?: ActorContext): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Internal-API-Key': this.internalApiKey || '',
    };

    if (actor?.id) {
      headers['X-Actor-Id'] = actor.id;
      headers['X-User-Id'] = actor.id;
    }

    if (actor?.email) {
      headers['X-Actor-Email'] = actor.email;
      headers['X-User-Email'] = actor.email;
    }

    return headers;
  }

  async createPatientForUser(userId: string, actor?: ActorContext): Promise<void> {
    this.initialize();
    
    try {
      const url = `${this.baseUrl}/api/patients/create`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: this.buildHeaders(actor),
        body: JSON.stringify({
          user_id: userId,
          emergency_contact: { name: '', phone: '' },
        } as CreatePatientRequest),
      });

      if (!response.ok) {
        const message = await response.text();
        console.error(`[IAM] Failed to create patient for user ${userId}: ${response.status} ${response.statusText} - ${message}`);
        return;
      }

      const data = await response.json() as any;
      console.log(`[IAM] ✅ Created patient ${data.patient?.patient_code} for user ${userId}`);
    } catch (error) {
      console.error(`[IAM] Error creating patient:`, error);
    }
  }

  async softDeletePatientByUserId(userId: string, actor?: ActorContext): Promise<void> {
    this.initialize();

    try {
      const url = `${this.baseUrl}/api/patients/soft-delete-by-user/${userId}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.buildHeaders(actor),
      });

      if (!response.ok) {
        const message = await response.text();
        console.error(`[IAM] Failed to soft delete patient for user ${userId}: ${response.status} ${response.statusText} - ${message}`);
        return;
      }

      console.log(`[IAM] ✅ Soft deleted patient for user ${userId}`);
    } catch (error) {
      console.error(`[IAM] Error soft deleting patient:`, error);
    }
  }
}

const patientServiceClient = new PatientServiceClient();
export default patientServiceClient;
