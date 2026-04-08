import { expect } from "../fixtures/lxd-test";
import type { Page } from "@playwright/test";
import { gotoURL } from "./navigate";
import { randomNameSuffix } from "./name";

export const randomImageRegistryName = (): string => {
  return `playwright-image-registry-${randomNameSuffix()}`;
};

export const visitImageRegistries = async (page: Page, project: string) => {
  await gotoURL(page, `/ui/project/${project}/image-registries`);
  await expect(page.getByTitle("Create image registry")).toBeDisabled();
};

export const selectAllRegistries = async (page: Page) => {
  await page.getByLabel("multiselect rows").first().click();
  await page.getByRole("menuitem", { name: "Select all" }).click();
};
