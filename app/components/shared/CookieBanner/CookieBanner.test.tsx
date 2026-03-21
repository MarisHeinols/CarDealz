import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CookieBanner from "./index";
import { BrowserRouter } from "react-router";

// Mock the translation hook
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue: string) => defaultValue || key,
  }),
}));

describe("CookieBanner", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    window.localStorage.clear();
  });

  const renderBanner = () => {
    render(
      <BrowserRouter>
        <CookieBanner />
      </BrowserRouter>
    );
  };

  it("renders the banner when no consent is found in localStorage", () => {
    renderBanner();
    
    expect(screen.getByText(/Cookies & Privacy/i)).toBeDefined();
    expect(screen.getByText("Accept All")).toBeDefined();
    expect(screen.getByText("Essential Only")).toBeDefined();
  });

  it("does not render if consent has already been accepted", () => {
    window.localStorage.setItem("balticauto_cookie_consent", "true");
    
    renderBanner();
    
    // queryByText returns null if not found
    expect(screen.queryByText(/Cookies & Privacy/i)).toBeNull();
  });

  it("closes the banner when Accept All is clicked", () => {
    renderBanner();
    
    const acceptButton = screen.getByText("Accept All");
    fireEvent.click(acceptButton);
    
    // Should immediately disappear
    expect(screen.queryByText(/Cookies & Privacy/i)).toBeNull();
    // LocalStorage should be set
    expect(window.localStorage.getItem("balticauto_cookie_consent")).toBe("true");
  });

  it("closes the banner when Essential Only is clicked", () => {
    renderBanner();
    
    const declineButton = screen.getByText("Essential Only");
    fireEvent.click(declineButton);
    
    // Should immediately disappear
    expect(screen.queryByText(/Cookies & Privacy/i)).toBeNull();
    // LocalStorage should be set to false
    expect(window.localStorage.getItem("balticauto_cookie_consent")).toBe("false");
  });
});
