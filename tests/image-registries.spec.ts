import { expect, test } from "./fixtures/lxd-test";
import { visitImageRegistries } from "./helpers/images";
import { gotoURL } from "./helpers/navigate";

test("search for an image registry", async ({ page }) => {
  await gotoURL(page, "/ui");
  await page.getByRole("button", { name: "Images" }).click();
  await page.getByRole("link", { name: "Registries", exact: true }).click();
  await expect(page.getByText("Create registry")).toBeDisabled();

  await page.getByPlaceholder("Search and filter").click();
  await page.getByPlaceholder("Search and filter").fill("ubuntu-daily"); //builtin image registry
  await page.getByPlaceholder("Search and filter").press("Enter");
  await page.getByPlaceholder("Add filter").press("Escape");

  await page
    .getByRole("row", { name: /ubuntu-daily/i })
    .getByRole("cell")
    .first()
    .click();
  await expect(page.getByText("Image registry summary")).toBeVisible();
});

test("search for built-in image registries", async ({ page }) => {
  await visitImageRegistries(page, "default");

  await page.getByPlaceholder("Search and filter").click();
  await page.getByPlaceholder("Search and filter").press("Enter");
  await page.getByRole("button", { name: /BUILTIN Yes/i }).click();
  await page.getByPlaceholder("Add filter").press("Escape");

  await expect(page.getByText("Showing all 5 image registries")).toBeVisible();
});
