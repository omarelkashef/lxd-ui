import type { FC } from "react";
import { useEffect, useState } from "react";
import {
  MainTable,
  Notification,
  Row,
  ScrollableTable,
  SearchBox,
  useNotify,
  Spinner,
  CustomLayout,
  useToastNotification,
} from "@canonical/react-components";
import NotificationRow from "components/NotificationRow";
import HelpLink from "components/HelpLink";
import { queryKeys } from "util/queryKeys";
import { fetchConfigOptions, updateSettings } from "api/server";
import { useQuery } from "@tanstack/react-query";
import { toConfigFields } from "util/config";
import PageHeader from "components/PageHeader";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import { useServerEntitlements } from "util/entitlements/server";
import { useClusteredSettings } from "context/useSettings";
import { useProjects } from "context/useProjects";
import {
  type UserConfigField,
  getConfigFieldClusteredValue,
  getConfigFieldRow,
  getConfigFieldValue,
  getUserConfigs,
  getUserConfigFieldInputRow,
  getAddConfigButton,
} from "util/settings";
import ResourceLabel from "components/ResourceLabel";
import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";

const Settings: FC = () => {
  const [query, setQuery] = useState("");

  const [userConfigs, setUserConfigs] = useState<UserConfigField[]>([]);

  const notify = useNotify();
  const toastNotify = useToastNotification();

  const {
    hasMetadataConfiguration,
    settings,
    isSettingsLoading,
    settingsError,
  } = useSupportedFeatures();

  const { data: projects = [] } = useProjects();

  useEffect(() => {
    if (userConfigs.length === 0) {
      setUserConfigs(getUserConfigs(settings?.config ?? {}, projects));
    }
  }, [settings, projects]);

  const addUserSetting = (index: number) => {
    const key = userConfigs[index].key;
    const value = userConfigs[index].value;

    const settingLabel = (
      <ResourceLabel bold type="setting" value={`user.${key}`} />
    );
    updateSettings({ [`user.${key}`]: value })
      .then(() => {
        setUserConfigs((prev) => {
          const copy = [...prev];
          copy[index].isSaved = true;
          copy[index].key = `user.${copy[index].key}`;
          return copy;
        });
        toastNotify.success(<>Setting {settingLabel} added</>);
      })
      .catch((e) => {
        notify.failure(`Setting add failed`, e, settingLabel);
      });
  };

  const deleteUserSetting = (userKey: string) => {
    const index = userConfigs.findIndex((c) => c.key === userKey);

    const settingLabel = <ResourceLabel bold type="setting" value={userKey} />;
    updateSettings({ [userKey]: "" })
      .then(() => {
        setUserConfigs((prev) => {
          const copy = [...prev];
          copy.splice(index, 1);
          return copy;
        });
        toastNotify.success(<>Setting {settingLabel} deleted</>);
      })
      .catch((e) => {
        notify.failure(`Setting delete failed`, e, settingLabel);
      });
  };

  const { canEditServerConfiguration } = useServerEntitlements();

  const { data: configOptions, isLoading: isConfigOptionsLoading } = useQuery({
    queryKey: [queryKeys.configOptions],
    queryFn: async () => fetchConfigOptions(hasMetadataConfiguration),
  });
  const { data: clusteredSettings = [], error: clusterError } =
    useClusteredSettings();

  if (clusterError) {
    notify.failure("Loading clustered settings failed", clusterError);
  }

  if (isConfigOptionsLoading || isSettingsLoading) {
    return <Spinner className="u-loader" text="Loading..." isMainComponent />;
  }

  if (settingsError) {
    notify.failure("Loading settings failed", settingsError);
  }

  const headers = [
    { content: "Group", className: "group" },
    { content: "Key", className: "key" },
    { content: "Value" },
  ];

  const configFields = toConfigFields(configOptions?.configs?.server ?? {});

  let lastCategory = "";
  const rows: MainTableRow[] = configFields
    .filter((configField) => {
      if (!query) {
        return true;
      }
      return (
        configField.key.toLowerCase().includes(query.toLowerCase()) ||
        configField.shortdesc?.toLowerCase().includes(query.toLowerCase())
      );
    })
    .map((configField, index, { length }) => {
      const value = getConfigFieldValue(configField, settings);
      const clusteredValue = getConfigFieldClusteredValue(
        clusteredSettings,
        configField,
      );
      const isNewCategory = lastCategory !== configField.category;
      lastCategory = configField.category;
      const isLast = index === length - 1;
      return getConfigFieldRow(
        configField,
        isLast,
        isNewCategory,
        clusteredValue,
        deleteUserSetting,
        settings,
        value,
      );
    });

  userConfigs.forEach((field, index) => {
    const isLast = index === length - 1;
    const isNewCategory = index === 0;

    const row = field.isSaved
      ? getConfigFieldRow(
          field,
          isLast,
          isNewCategory,
          {},
          deleteUserSetting,
          settings,
          getConfigFieldValue(field, settings),
        )
      : getUserConfigFieldInputRow(
          field,
          userConfigs,
          index,
          setUserConfigs,
          addUserSetting,
        );

    rows.push(row);
  });

  rows.push(getAddConfigButton(setUserConfigs));

  return (
    <>
      <CustomLayout
        header={
          <PageHeader>
            <PageHeader.Left>
              <PageHeader.Title>
                <HelpLink
                  docPath="/server/"
                  title="Learn more about server configuration"
                >
                  Settings
                </HelpLink>
              </PageHeader.Title>
              <PageHeader.Search>
                <SearchBox
                  name="search-setting"
                  type="text"
                  className="u-no-margin--bottom"
                  onChange={(value) => {
                    setQuery(value);
                  }}
                  placeholder="Search"
                  value={query}
                />
              </PageHeader.Search>
            </PageHeader.Left>
          </PageHeader>
        }
        contentClassName="settings"
      >
        <NotificationRow />
        <Row>
          {!canEditServerConfiguration() && (
            <Notification
              severity="caution"
              title="Restricted permissions"
              titleElement="h2"
            >
              You do not have permission to view or edit server settings
            </Notification>
          )}
          {!hasMetadataConfiguration && canEditServerConfiguration() && (
            <Notification
              severity="information"
              title="Get more server settings"
              titleElement="h2"
            >
              Update to LXD v5.19.0 or later to access more server settings
            </Notification>
          )}
          {canEditServerConfiguration() && (
            <ScrollableTable
              dependencies={[notify.notification, rows]}
              tableId="settings-table"
              belowIds={["status-bar"]}
            >
              <MainTable
                id="settings-table"
                headers={headers}
                rows={rows}
                emptyStateMsg="No data to display"
              />
            </ScrollableTable>
          )}
        </Row>
      </CustomLayout>
    </>
  );
};

export default Settings;
