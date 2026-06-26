import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

export const base44 = createClient({
  appId: appId || import.meta.env.VITE_BASE44_APP_ID,
  token,
  functionsVersion,
  requiresAuth: false,
  appBaseUrl: appBaseUrl || import.meta.env.VITE_BASE44_APP_BASE_URL,
  headers: {
    api_key: import.meta.env.VITE_BASE44_API_KEY,
  },
});
