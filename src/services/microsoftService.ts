export interface MicrosoftIntegrationStatus {
  success: boolean;
  teamsWebhookConfigured: boolean;
}

export interface TeamsTestResponse {
  success: boolean;
  result?: {
    sent: boolean;
    reason?: string;
  };
}

export const microsoftService = {
  async getStatus(): Promise<MicrosoftIntegrationStatus> {
    const response = await fetch('/api/integrations/microsoft/status');
    if (!response.ok) {
      throw new Error('No se pudo obtener el estado de Microsoft Teams');
    }

    return response.json();
  },

  async sendTeamsTest(message?: string): Promise<TeamsTestResponse> {
    const response = await fetch('/api/integrations/microsoft/teams/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error('No se pudo enviar la notificacion de prueba a Teams');
    }

    return response.json();
  },
};
