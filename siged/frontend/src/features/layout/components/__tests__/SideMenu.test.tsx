import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { SideMenu } from "@/features/layout/components/SideMenu";

function renderSideMenu(isOpen: boolean, onClose = vi.fn()) {
  return render(
    <BrowserRouter>
      <SideMenu isOpen={isOpen} onClose={onClose} />
    </BrowserRouter>,
  );
}

describe("SideMenu", () => {
  it("should not render when closed", () => {
    const { container } = renderSideMenu(false);
    expect(container.innerHTML).toBe("");
  });

  it("should render when open", () => {
    renderSideMenu(true);
    expect(screen.getByText("Menú principal")).toBeInTheDocument();
  });

  it("should call onClose when overlay is clicked", () => {
    const onClose = vi.fn();
    renderSideMenu(true, onClose);

    const overlay = document.querySelector(".bg-overlay");
    expect(overlay).toBeInTheDocument();
    fireEvent.click(overlay!);
    expect(onClose).toHaveBeenCalled();
  });

  it("should call onClose when close button is clicked", () => {
    const onClose = vi.fn();
    renderSideMenu(true, onClose);

    fireEvent.click(screen.getByLabelText("Cerrar menú"));
    expect(onClose).toHaveBeenCalled();
  });
});
