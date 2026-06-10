import { expect, test, type LxdVersions } from "../fixtures/lxd-test";
import { randomNameSuffix } from "./name";
import type { Page } from "@playwright/test";
import { gotoURL } from "./navigate";
import { dismissNotification } from "./notification";

export const skipIfNotSupported = (lxdVersion: LxdVersions) => {
  test.skip(
    lxdVersion === "5.0-edge" || lxdVersion === "5.21-edge",
    "Cluster tests not supported for lxd 5.0",
  );
};

export const randomLinkName = (): string => {
  return `playwright-cluster-link-${randomNameSuffix()}`;
};

export const visitClusterLinks = async (page: Page) => {
  await gotoURL(page, "/ui/");
  await page.getByRole("button", { name: "Clustering" }).click();
  await page.getByRole("link", { name: "Links" }).click();
  await expect(
    page.getByRole("button").filter({ hasText: "Create link" }),
  ).toBeVisible();
};

export const createClusterLink = async (
  page: Page,
  link: string,
  token?: string,
) => {
  await visitClusterLinks(page);
  await page.getByRole("button", { name: "Create link" }).click();
  await expect(page.getByText("Create cluster link")).toBeVisible();
  await page.getByPlaceholder("Enter name").fill(link);
  const panel = page.getByLabel("Side panel");
  if (token) {
    await page.getByText("I have a token").check();
    await page.getByPlaceholder("Enter token").fill(token);
  }
  panel.getByRole("rowheader").filter({ hasText: "admins" }).click();
  await panel.getByRole("button", { name: "Create link" }).click();

  await expect(page.getByText(`Cluster link ${link} created`)).toBeVisible();

  if (!token) {
    await page.getByText("I have copied the token").click();
    await page.getByRole("button", { name: "Done" }).click();
  } else {
    await dismissNotification(page, `Cluster link ${link} created.`);
  }
};

export const editClusterLink = async (page: Page, link: string) => {
  const row = page.getByRole("row").filter({ hasText: link });
  await row.getByRole("button", { name: "Edit cluster link" }).click();
  await expect(page.getByText(`Edit cluster link ${link}`)).toBeVisible();

  const description = "My link";
  await page.getByPlaceholder("Enter description").fill(description);
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText(`Cluster link ${link} saved.`)).toBeVisible();

  await expect(row.getByText(description)).toBeVisible();
};

export const deleteClusterLink = async (page: Page, link: string) => {
  const row = page.getByRole("row").filter({ hasText: link });
  await row.getByRole("button", { name: "Delete cluster link" }).click();
  await page
    .getByRole("dialog", { name: "Confirm delete" })
    .getByRole("button", { name: "Delete cluster link" })
    .click();

  await dismissNotification(page, `Cluster link ${link} deleted.`);
};
