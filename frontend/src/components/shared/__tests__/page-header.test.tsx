import { render, screen } from "@testing-library/react";
import { PageHeader } from "../page-header";

describe("PageHeader", () => {
  it("renders title and description", () => {
    render(<PageHeader title="Test" description="Desc" />);
    expect(screen.getByRole("heading", { name: "Test" })).toBeInTheDocument();
    expect(screen.getByText("Desc")).toBeInTheDocument();
  });
});
