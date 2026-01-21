import { productsApi } from "./base";
import { checkoutsApi } from "./checkouts";
import { coproducersApi } from "./coproducers";
import { couponsApi } from "./coupons";
import { deliverablesApi } from "./deliverables";
import { offersApi } from "./offers";
import { settingsApi } from "./settings";
import { strategiesApi } from "./strategies";
import { trackingsApi } from "./trackings";

export const productApi = {
  ...productsApi,
  ...deliverablesApi,
  ...offersApi,
  ...checkoutsApi,
  ...settingsApi,
  ...trackingsApi,
  ...strategiesApi,
  ...couponsApi,
  ...coproducersApi,
};

export {
  productsApi,
  deliverablesApi,
  offersApi,
  checkoutsApi,
  settingsApi,
  trackingsApi,
  strategiesApi,
  couponsApi,
  coproducersApi,
};
