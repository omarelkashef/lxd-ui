import { expect, test } from "./fixtures/lxd-test";
import { visitImageRegistries } from "./helpers/image-registries";
import { randomImageRegistryName } from "./helpers/image-registries";

// TODO: NEEDS A CLUSTER link AND
//update url, source_project and cluster fields
test("create public LXD image registry", async ({ page }) => {
  const registryName = randomImageRegistryName();
  await visitImageRegistries(page, "default");
  await page.getByTitle("Create registry").click();
  await expect(
    page.getByRole("heading", { name: "Create image registry" }),
  ).toBeVisible();

  await page.getByLabel("Name").fill(registryName);
  await page.getByLabel("Description").fill("Playwright LXD registry");
  await page.getByLabel("Protocol").selectOption("lxd");
  await page.getByLabel("URL").fill("images.example.com");
  await page.getByLabel("Public").selectOption("true");
  await expect(page.getByLabel("Cluster")).toBeDisabled();

  await page.getByLabel("Source Project").fill("images");
  await page.getByLabel("Cluster").selectOption("cluster1");
  await expect(page.getByRole("button", { name: "Create" })).toBeEnabled();

  await page.getByRole("button", { name: "Create" }).click();

  await expect(
    page.getByText(`Image registry ${registryName} created.`),
  ).toBeVisible();

  const createdRow = page.getByRole("row", { name: registryName, exact: true });
  await expect(createdRow).toContainText("lxd");
  await expect(createdRow).toContainText("No");
  await expect(createdRow).toContainText("Yes");
});

// TODO: NEEDS A CLUSTER link AND
//update url, source_project and cluster fields
test("create private LXD image registry", async ({ page }) => {
  const registryName = randomImageRegistryName();
  await visitImageRegistries(page, "default");
  await page.getByTitle("Create registry").click();
  await expect(
    page.getByRole("heading", { name: "Create image registry" }),
  ).toBeVisible();

  await page.getByLabel("Name").fill(registryName);
  await page.getByLabel("Description").fill("Playwright LXD registry");
  await page.getByLabel("Protocol").selectOption("lxd");
  await page.getByLabel("URL").fill("images.example.com");
  await page.getByLabel("Public").selectOption("false");
  await page.getByLabel("Source Project").fill("images");
  await page.getByLabel("Cluster").selectOption("cluster1");
  await expect(page.getByRole("button", { name: "Create" })).toBeEnabled();

  await page.getByRole("button", { name: "Create" }).click();

  await expect(
    page.getByText(`Image registry ${registryName} created.`),
  ).toBeVisible();

  const createdRow = page.getByRole("row", { name: registryName, exact: true });
  await expect(createdRow).toContainText("lxd");
  await expect(createdRow).toContainText("No");
  await expect(createdRow).toContainText("No");
});
