import type { LxdSettings } from "types/server";
import type { ConfigField, LxdConfigPair } from "types/config";
import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import type { LXDSettingOnClusterMember } from "types/server";
import type { ClusterSpecificValues } from "components/ClusterSpecificSelect";
import SettingForm from "pages/settings/SettingForm";
import ConfigFieldDescription from "pages/settings/ConfigFieldDescription";
import { Input, Button, Form } from "@canonical/react-components";
import { getDefaultProject } from "util/loginProject";
import type { LxdProject } from "types/project";
import { generateUUID } from "util/helpers";

export type UserConfigField = ConfigField & {
  value?: string;
  isSaved: boolean;
};

type SetUserConfigs = (
  prev: (prev: UserConfigField[]) => UserConfigField[],
) => void;

export const supportsOvnNetwork = (
  settings: LxdSettings | undefined,
): boolean => {
  return Boolean(
    settings?.config?.["network.ovn.northbound_connection"] ?? false,
  );
};

export const isClusteredServer = (
  settings: LxdSettings | undefined,
): boolean => {
  return settings?.environment?.server_clustered ?? false;
};

export const hasMicroCloudFlag = (settings?: LxdSettings): boolean => {
  return Boolean(settings?.config?.["user.microcloud"]);
};

export const getConfigFieldValue = (
  configField: ConfigField,
  settings?: LxdSettings,
): string | undefined => {
  for (const [key, value] of Object.entries(settings?.config ?? {})) {
    if (key === configField.key) {
      return value;
    }
  }
  if (configField.type === "bool") {
    return configField.default === "true" ? "true" : "false";
  }
  if (configField.default === "-") {
    return undefined;
  }
  return configField.default;
};

export const getConfigFieldClusteredValue = (
  clusteredSettings: LXDSettingOnClusterMember[],
  configField: ConfigField,
): ClusterSpecificValues => {
  const settingPerClusterMember: ClusterSpecificValues = {};

  clusteredSettings?.forEach((item) => {
    settingPerClusterMember[item.memberName] =
      item.config?.[configField.key] ?? configField.default ?? "";
  });
  return settingPerClusterMember;
};

export const getUserConfigs = (
  configPairs: LxdConfigPair,
  projects: LxdProject[],
): UserConfigField[] => {
  const configs: UserConfigField[] = [
    {
      key: "user.ui_grafana_base_url",
      category: "user",
      default: "",
      longdesc:
        "e.g. https://example.org/dashboard?project={project}&name={instance}\n or https://192.0.2.1:3000/d/bGY-LSB7k/lxd?orgId=1",
      shortdesc:
        "LXD will replace `{instance}` and `{project}` with project and instance names for deep-linking to individual grafana pages.\nSee {ref}`grafana` for more information.",
      type: "string",
      isSaved: true,
    },
    {
      key: "user.ui_login_project",
      category: "user",
      default: getDefaultProject(projects),
      shortdesc: "Project to display on login.",
      type: "string",
      isSaved: true,
    },
    {
      key: "user.ui_theme",
      category: "user",
      default: "",
      shortdesc:
        "Set UI to dark theme, light theme, or to match the system theme.",
      type: "string",
      isSaved: true,
    },
    {
      key: "user.ui_title",
      category: "user",
      default: "",
      shortdesc:
        "Title for the LXD-UI web page. Shows the hostname when unset.",
      type: "string",
      isSaved: true,
    },
  ];

  Object.entries(configPairs ?? {})
    .filter(
      ([key, _]) =>
        key.startsWith("user.") && !configs.some((c) => c.key === key), //Do not duplicate ui user defined configs
    )
    .forEach(([key, _]) => {
      configs.push({
        key: key,
        category: "user",
        default: "",
        type: "string",
        isUserDefined: true,
        isSaved: true,
      });
    });

  return configs;
};

export const getConfigFieldRow = (
  configField: ConfigField,
  isLast: boolean,
  isNewCategory: boolean,
  clusteredValue: ClusterSpecificValues,
  deleteUserSetting: (key: string) => void,
  settings?: LxdSettings,
  value?: string,
): MainTableRow => {
  const isDefault = !Object.keys(settings?.config ?? {}).some(
    (key) => key === configField.key,
  );
  return {
    key: configField.key,
    columns: [
      {
        content: isNewCategory && (
          <h2 className="p-heading--5">{configField.category}</h2>
        ),
        role: "rowheader",
        className: "group",
        "aria-label": "Group",
      },
      {
        content: (
          <div className="key-cell">
            {isDefault ? configField.key : <strong>{configField.key}</strong>}
            <p className="p-text--small u-text--muted u-no-margin--bottom">
              <ConfigFieldDescription description={configField.shortdesc} />
            </p>
          </div>
        ),
        role: "cell",
        className: "key",
        "aria-label": "Key",
      },
      {
        content: (
          <SettingForm
            configField={configField}
            value={value}
            clusteredValue={clusteredValue}
            isLast={isLast}
            onDelete={deleteUserSetting}
          />
        ),
        role: "cell",
        "aria-label": "Value",
        className: "u-vertical-align-middle",
      },
    ],
  };
};

export const getUserConfigFieldInputRow = (
  userConfig: UserConfigField,
  userConfigs: UserConfigField[],
  index: number,
  setNewUserConfigs: SetUserConfigs,
  addUserConfig: (index: number) => void,
): MainTableRow => {
  const isKeyDuplicate = (key: string) => {
    return userConfigs.some((cf) => `user.${key}` === cf.key);
  };
  const isFormDisabled = () => {
    return (
      isKeyDuplicate(userConfig.key) || !userConfig.value || !userConfig.key
    );
  };

  return {
    key: `${generateUUID()}`,
    columns: [
      {
        content: false,
        role: "rowheader",
        className: "group",
        "aria-label": "Group",
      },
      {
        content: (
          <>
            <Input
              aria-label="new user key"
              id={`new-user-defined-key-${index}`}
              placeholder="User key"
              type="text"
              value={userConfig.key}
              autoFocus
              error={
                isKeyDuplicate(userConfig.key) && (
                  <>Setting with this name already exists</>
                )
              }
              onChange={(e) => {
                setNewUserConfigs((prev) => {
                  const copy = [...prev];
                  copy[index] = {
                    ...copy[index],
                    key: e.target.value,
                  };
                  return copy;
                });
              }}
              help={
                <>
                  Key will be saved as <code>{"user.{your-key}"}</code>. Enter
                  only the part after user.
                </>
              }
            />
          </>
        ),
        role: "cell",
        className: "key",
        "aria-label": "key",
      },
      {
        content: (
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              addUserConfig(index);
            }}
          >
            <Input
              type="submit"
              hidden
              value="Hidden input"
              disabled={isFormDisabled()}
            />
            <Input
              aria-label="new user value"
              id={`new-user-defined-value-${index}`}
              placeholder="Value"
              type="text"
              value={userConfig.value}
              onChange={(e) => {
                setNewUserConfigs((prev) => {
                  const copy = [...prev];
                  copy[index] = {
                    ...copy[index],
                    value: e.target.value,
                  };
                  return copy;
                });
              }}
            />
            <Button
              type="button"
              appearance="base"
              className="button"
              onClick={() => {
                setNewUserConfigs((prev) => {
                  const copy = [...prev];
                  copy.splice(index, 1);
                  return copy;
                });
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isFormDisabled()}
              appearance="positive"
            >
              Save
            </Button>
          </Form>
        ),
        role: "cell",
        className: "u-vertical-align-middle",
        "aria-label": "Value",
      },
    ],
  };
};

export const getAddConfigButton = (setNewUserConfigs: SetUserConfigs) => {
  return {
    key: "add-user-config-button",
    columns: [
      {
        content: false,
        role: "rowheader",
        className: "group",
        "aria-label": "Group",
      },
      {
        content: (
          <Button
            type="button"
            onClick={() => {
              setNewUserConfigs((prev) => {
                return [
                  ...prev,
                  {
                    key: "",
                    value: "",
                    default: "",
                    category: "user",
                    type: "string",
                    isSaved: false,
                    isUserDefined: true,
                  },
                ];
              });
            }}
          >
            Add key
          </Button>
        ),
        role: "cell",
        className: "key",
      },
    ],
  };
};
