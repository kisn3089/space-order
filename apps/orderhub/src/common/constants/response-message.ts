const RESPONSE_MESSAGE = {
  unauthorized: 'Invalid Credentials',
  forbidden: 'Access to this resource is forbidden',
  invalidBody: 'Invalid request body',
  invalidParams: 'Invalid request params',
  invalidQuery: 'Invalid request query',
  invalidTableSession: 'Invalid or inactive table session',
  missingTableSession: 'Missing table session',
  expiredTableSession: 'Session expired',
  notFoundThat: 'Not found resource',
} as const;

type ResponseMessageKey = keyof typeof RESPONSE_MESSAGE;

export function responseMessage<K extends ResponseMessageKey>(
  key: K,
): (typeof RESPONSE_MESSAGE)[K] {
  return RESPONSE_MESSAGE[key];
}
