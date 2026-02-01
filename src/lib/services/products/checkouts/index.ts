import { checkoutRequests } from "./checkout";
import { depoimentsRequests } from "./depoiments";
import { messagesRequests } from "./messages";
import { paymentMethodRequests } from "./paymentMethod";

export const checkoutsApi = {
  ...checkoutRequests,
  ...depoimentsRequests,
  ...messagesRequests,
  ...paymentMethodRequests,
};

export {
  checkoutRequests,
  depoimentsRequests,
  messagesRequests,
  paymentMethodRequests,
};
