import {
  Form,
  Input,
  PrefixedInput,
  Select,
} from "@canonical/react-components";
import type { FC } from "react";
import type { FormikProps } from "formik/dist/types";
import type { ImageRegistryFormValues } from "types/forms/image";

interface Props {
  formik: FormikProps<ImageRegistryFormValues>;
  isEdit?: boolean;
}

export const ImageRegistryForm: FC<Props> = ({ formik, isEdit = false }) => {
  const getFieldError = (fieldName: keyof ImageRegistryFormValues) => {
    return formik.touched[fieldName] ? formik.errors[fieldName] : undefined;
  };

  return (
    <Form onSubmit={formik.handleSubmit}>
      {/* hidden submit to enable enter key in inputs */}
      <Input type="submit" hidden value="Hidden input" />
      <Input
        {...formik.getFieldProps("name")}
        type="text"
        label="Name"
        required
        autoFocus={!isEdit}
        error={getFieldError("name")}
        placeholder="Enter name"
        disabled={isEdit}
        title={isEdit ? "Image registries can't be renamed" : undefined}
      />
      <Input
        {...formik.getFieldProps("description")}
        type="text"
        autoFocus={isEdit}
        label="Description"
        placeholder="Enter description"
        error={getFieldError("description")}
      />
      <Select
        {...formik.getFieldProps("protocol")}
        label="Protocol"
        options={[
          { value: "lxd", label: "LXD" },
          { value: "simplestreams", label: "SimpleStreams" },
        ]}
      />
      <PrefixedInput
        {...formik.getFieldProps("url")}
        autoFocus={isEdit}
        immutableText="https://"
        value={formik.values.url?.split("//")[1] ?? ""}
        label="URL"
        placeholder="Enter URL"
        error={getFieldError("url")}
        onChange={(e) => {
          formik.setFieldValue("url", `https://${e.target.value}`);
        }}
        help="Source URL for the image registry"
      />
      <Select
        {...formik.getFieldProps("public")}
        label="Public"
        options={[
          { value: "true", label: "Yes" },
          { value: "false", label: "No" },
        ]}
        help="Public image registries require no authentication and can only access public images on the servers they point to."
        disabled={formik.values.protocol === "simplestreams"}
        title={
          formik.values.protocol === "simplestreams"
            ? "SimpleStreams protocol are always public."
            : undefined
        }
      />
      <Input
        {...formik.getFieldProps("source_project")}
        type="text"
        autoFocus={isEdit}
        label="Source Project"
        placeholder="Enter source project"
        error={getFieldError("source_project")}
        disabled={formik.values.protocol === "simplestreams"}
        help="Source project for image registry using LXD protocol"
        title={
          formik.values.protocol === "simplestreams"
            ? "Source project is not applicable for SimpleStreams protocol."
            : undefined
        }
      />
      <Select
        {...formik.getFieldProps("cluster")}
        label="Cluster"
        options={[
          { value: "", label: "None" },
          { value: "cluster1", label: "cluster1" },
          { value: "cluster2", label: "cluster2" }, //add custom select
        ]}
        disabled={formik.values.protocol === "simplestreams"}
        help="Cluster for image registry using LXD protocol."
      />
    </Form>
  );
};
