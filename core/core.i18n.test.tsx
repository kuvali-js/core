import { renderHook } from "@testing-library/react-native";
import { CoreProvider, useI18n } from "@kuvali-js/core";

import AsyncStorage from "@react-native-async-storage/async-storage";

//=============================================================================
// Helper functions
const renderI18nHook = (configOverride = {}) => {
  const config = { i18n: { defaultLocale: "en", ...configOverride } };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <CoreProvider config={config}>{children}</CoreProvider>
  );

  return renderHook(() => useI18n(), { wrapper });
};

//=============================================================================
describe("Kuvali Core/i18n integration", () => {
  //###############################################################################
  describe("Initialization", () => {
    //=============================================================================
    it("should throw specific error when used outside of provider", () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {}); // 1. Silence the console for this specific error

      expect(() => renderHook(() => useI18n())).toThrow(
        "Kuvali i18n not initialized",
      ); // 2. Assert exact error message

      consoleSpy.mockRestore(); // 3. Clean up
    });

    //=============================================================================
    it("should initialize with config called via CoreProvider", () => {
      const { result } = renderI18nHook();
      expect(result.current.locale).toBe("en"); // 3. Assert: Check for actual functionality/state
      expect(typeof result.current.t).toBe("function");
    });
  });

  //###############################################################################
  describe("Set Language", () => {
    //=============================================================================
    it('should return the defaultLocale="en"', () => {
      const { result } = renderI18nHook();
      expect(result.current.locale).toBe("en");
    });

    //=============================================================================
    it('should change locale from "en" to "sw"', () => {
      const { result } = renderI18nHook();
      expect(result.current.locale).toBe("en"); // Verify initial state

      const { act } = require("@testing-library/react-native"); // 2. Act: Change to Swahili
      act(() => {
        result.current.setLocale("sw");
      });

      expect(result.current.locale).toBe("sw"); // 3. Assert: Verify new state
    });

    //=============================================================================
    describe("Locale Persistence", () => {
      beforeEach(async () => {
        await AsyncStorage.clear(); // Clear storage before each test to ensure isolation
      });

      it("should persist the locale choice when setLocale is called", async () => {
        const config = { i18n: { defaultLocale: "en" } };
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <CoreProvider config={config}>{children}</CoreProvider>
        );

        const { result } = renderHook(() => useI18n(), { wrapper });

        // 1. Act: Change language to 'sw'
        const { act } = require("@testing-library/react-native");
        await act(async () => {
          await result.current.setLocale("sw");
        });

        // 2. Assert: Check if it was saved in AsyncStorage
        // Assuming your key is 'kuvali-locale'
        const savedLocale = await AsyncStorage.getItem("kuvali-locale");
        expect(savedLocale).toBe("sw");
      });

      it("should load the persisted locale on initialization", async () => {
        // 1. Arrange: Pre-set a locale in storage
        await AsyncStorage.setItem("kuvali-locale", "sw");

        const config = { i18n: { defaultLocale: "en" } };
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <CoreProvider config={config}>{children}</CoreProvider>
        );

        // 2. Act: Initialize the hook
        const { result } = renderHook(() => useI18n(), { wrapper });

        // 3. Assert: Initial locale should be the persisted one, not the default
        // This might require a small delay or use of 'waitFor' depending on your implementation
        expect(result.current.locale).toBe("sw");
      });
    });

    //=============================================================================
  });

  //###############################################################################
  describe("Translations", () => {
    //=============================================================================
    it("should return the key itself if translation is missing", () => {
      const config = { i18n: { defaultLocale: "en" } };
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CoreProvider config={config}>{children}</CoreProvider>
      );

      const { result } = renderHook(() => useI18n(), { wrapper });

      // Test for a key that definitely does not exist
      expect(result.current.t("non_existent_key")).toBe("non_existent_key");
    });
  });

  //=============================================================================
});
//=== END =====================================================================
