import { expect, test } from "./fixtures/lxd-test";
import { visitImageRegistries } from "./helpers/image-registries";
import { randomImageRegistryName } from "./helpers/image-registries";
import { gotoURL } from "./helpers/navigate";

test("search for an image registry", async ({ page }) => {
  const builtinRegistryName = "ubuntu-daily";
  await gotoURL(page, "/ui");
  await page.getByRole("button", { name: "Images" }).click();
  await page.getByRole("link", { name: "Registries", exact: true }).click();
  await expect(page.getByTitle("Create registry")).toBeVisible();

  await page.getByPlaceholder("Search and filter").click();
  await page.getByPlaceholder("Search and filter").fill(builtinRegistryName); //builtin image registry
  await page.getByPlaceholder("Search and filter").press("Enter");
  await page.getByPlaceholder("Add filter").press("Escape");

  const row = page.getByRole("row", {
    name: builtinRegistryName,
    exact: true,
  });
  await expect(row).toBeVisible();
  await expect(row).toContainText(builtinRegistryName);
  await expect(row).toContainText("lxd");
  await expect(row).toContainText("No");
  await expect(row).toContainText("Yes");
});

test("search for built-in image registries", async ({ page }) => {
  await visitImageRegistries(page, "default");

  await page.getByPlaceholder("Search and filter").click();
  await page.getByPlaceholder("Search and filter").press("Enter");
  await page.getByRole("button", { name: /BUILTIN Yes/i }).click();
  await page.getByPlaceholder("Add filter").press("Escape");

  await expect(page.getByText("Showing all 5 image registries")).toBeVisible();
});

test("create SimpleStreams image registry", async ({ page }) => {
  const registryName = randomImageRegistryName();
  await visitImageRegistries(page, "default");
  await page.getByTitle("Create registry").click();
  await expect(
    page.getByRole("heading", { name: "Create image registry" }),
  ).toBeVisible();

  await page.getByLabel("Name").fill(registryName);
  await page
    .getByLabel("Description")
    .fill("Playwright SimpleStreams registry");
  await page.getByLabel("Protocol").selectOption("simplestreams");
  await expect(page.getByLabel("Public")).toBeDisabled();
  await expect(page.getByLabel("Public")).toHaveValue("true");
  await expect(page.getByLabel("Source Project")).toBeDisabled();
  await expect(page.getByLabel("Cluster")).toBeDisabled();

  await page.getByLabel("URL").fill("ubuntu.com");

  await expect(page.getByRole("button", { name: "Create" })).toBeEnabled();
  await page.getByRole("button", { name: "Create" }).click();

  await expect(
    page.getByText(`Image registry ${registryName} created.`),
  ).toBeVisible();

  const createdRow = page.getByRole("row", { name: registryName, exact: true });
  await expect(createdRow).toContainText(registryName);
  await expect(createdRow).toContainText("simplestreams");
  await expect(createdRow).toContainText("No");
  await expect(createdRow).toContainText("Yes");
});
