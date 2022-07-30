import {
  Ref,
  ref,
  computed,
  onMounted,
  ComputedRef,
  inject,
  provide,
} from "vue";
import { getAvailableSalutations } from "@shopware-pwa/shopware-6-client";
import { ClientApiError, Salutation } from "@shopware-pwa/types";
import { useShopwareContext } from "./useShopwareContext";
// import {
//   useSharedState,
//   getApplicationContext,
// } from "@shopware-pwa/composables";

/**
 * @beta
 */
export interface IUseSalutations {
  mountedCallback: () => Promise<void>;
  getSalutations: ComputedRef<Salutation[]>;
  fetchSalutations: () => Promise<void>;
  error: Ref<any>;
}

/**
 * @beta
 */
export function useSalutations(): IUseSalutations {
  const COMPOSABLE_NAME = "useSalutations";
  const contextName = COMPOSABLE_NAME;

  const { apiInstance } = useShopwareContext();
  // const { sharedRef } = useSharedState();
  // const _salutations: Ref<Salutation[] | null> = sharedRef(
  //   `sw-${contextName}-salutations`
  // );
  const _salutations = inject("swSalutations", ref());
  provide("swSalutations", _salutations);

  const error: Ref<any> = ref(null);

  const fetchSalutations = async (): Promise<void> => {
    try {
      const { elements } = await getAvailableSalutations(apiInstance);
      _salutations.value = elements;
    } catch (e) {
      const err = e as ClientApiError;
      error.value = err.messages;
    }
  };

  // created separate function for testing proposes
  const mountedCallback = async () => {
    if (!_salutations.value) {
      await fetchSalutations();
    }
  };

  const getSalutations = computed(() => {
    return _salutations.value || [];
  });

  onMounted(mountedCallback);

  return {
    mountedCallback,
    fetchSalutations,
    getSalutations,
    error,
  };
}