export const PROVIDERS = [
  {
    id: "openai",
    label: "OpenAI",
    protocol: "openai",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4.1-mini"
  },
  {
    id: "anthropic",
    label: "Anthropic",
    protocol: "anthropic",
    baseUrl: "https://api.anthropic.com/v1",
    model: "claude-3-5-haiku-latest"
  },
  {
    id: "gemini",
    label: "Gemini",
    protocol: "gemini",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    model: "gemini-2.0-flash"
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    protocol: "openai",
    baseUrl: "https://api.deepseek.com",
    model: "deepseek-chat"
  },
  {
    id: "qwen",
    label: "通义千问",
    protocol: "openai",
    baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    model: "qwen-plus"
  },
  {
    id: "kimi",
    label: "Kimi",
    protocol: "openai",
    baseUrl: "https://api.moonshot.cn/v1",
    model: "moonshot-v1-8k"
  },
  {
    id: "custom",
    label: "自定义兼容接口",
    protocol: "openai",
    baseUrl: "",
    model: ""
  }
];

export const SESSION_KEY = "xiaojing:model-session:v1";
export const DEVICE_KEY = "xiaojing:model-device:v1";
export const RECORDS_KEY = "xiaojing:private-records:v1";

export function providerById(id) {
  return PROVIDERS.find((provider) => provider.id === id) || PROVIDERS[0];
}

export function defaultProviderSettings() {
  const provider = PROVIDERS[0];
  return {
    providerId: provider.id,
    protocol: provider.protocol,
    apiKey: "",
    baseUrl: provider.baseUrl,
    model: provider.model,
    rememberOnDevice: false,
    temperature: 0.55,
    maxTokens: 700
  };
}

export function readProviderSettings() {
  try {
    const session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
    if (session) return { ...defaultProviderSettings(), ...session };
    const device = JSON.parse(localStorage.getItem(DEVICE_KEY) || "null");
    if (device) return { ...defaultProviderSettings(), ...device, rememberOnDevice: true };
  } catch {
    // Storage can be unavailable in hardened browser modes.
  }
  return defaultProviderSettings();
}

export function writeProviderSettings(settings) {
  const safe = { ...settings };
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(safe));
    if (settings.rememberOnDevice) {
      localStorage.setItem(DEVICE_KEY, JSON.stringify(safe));
    } else {
      localStorage.removeItem(DEVICE_KEY);
    }
  } catch {
    // The current in-memory settings remain usable.
  }
}

export function clearProviderSettings() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(DEVICE_KEY);
  } catch {
    // Nothing else to clear.
  }
}

