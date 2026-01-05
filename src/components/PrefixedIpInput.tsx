import { type ClipboardEvent, type ReactElement } from "react";
import PrefixedInput from "./PrefixedInput";
import type { PrefixedInputProps } from "./PrefixedInput";
import {
  getImmutableAndEditableOctets,
  getIpRangeFromCidr,
} from "util/subnetIpRange";

type Props = Omit<
  PrefixedInputProps,
  "immutableText" | "maxLength" | "name" | "placeholder"
> & {
  cidr: string;
  ip: string;
  name: string;
  onIpChange: (ip: string) => void;
};

const isIPv4 = (ip: string) => {
  const ipv4Regex =
    /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

  return ipv4Regex.test(ip);
};

const PrefixedIpInput = ({
  cidr,
  name,
  help,
  onIpChange,
  ip,
  ...props
}: Props): ReactElement => {
  const [networkAddress] = cidr.split("/");
  const isIPV4 = isIPv4(networkAddress);

  const immutableIPV6 = networkAddress.substring(
    0,
    networkAddress.lastIndexOf(":"),
  );
  const ipv6PlaceholderColons = 7 - (immutableIPV6.match(/:/g) || []).length; // 7 is the maximum number of colons in an IPv6 address
  const editableIPV6 = `${"0000:".repeat(ipv6PlaceholderColons)}0000`;

  const [startIp, endIp] = getIpRangeFromCidr(cidr);
  const [immutableIPV4, editableIPV4] = getImmutableAndEditableOctets(
    startIp,
    endIp,
  );

  const inputValue = isIPV4
    ? ip.split(".").slice(immutableIPV4.split(".").length).join(".")
    : ip.replace(immutableIPV6, "");

  const placeHolderText = isIPV4 ? editableIPV4 : editableIPV6;

  const getIPv4MaxLength = () => {
    const immutableOctetsLength = immutableIPV4.split(".").length;
    const lengths = [15, 11, 7, 3]; // Corresponding to 0-3 immutable octets
    return lengths[immutableOctetsLength];
  };

  const maxLength = isIPV4 ? getIPv4MaxLength() : editableIPV6.length;

  const setIp = (editableValue: string) => {
    const fullIp = editableValue
      ? isIPV4
        ? `${immutableIPV4}.${editableValue}`
        : `${immutableIPV6}${editableValue}`
      : "";
    onIpChange(fullIp);
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    if (isIPV4) {
      const octets = pastedText.split(".");
      const trimmed = octets.slice(0 - editableIPV4.split(".").length);
      const ip = trimmed.join(".");
      setIp(ip);
    } else {
      const ip = pastedText.replace(immutableIPV6, "");
      setIp(ip);
    }
  };
  return (
    <PrefixedInput
      help={
        help ? (
          help
        ) : (
          <>
            {isIPV4 ? (
              <>
                The available range in this subnet is{" "}
                <code>
                  {immutableIPV4}.{editableIPV4}
                </code>
              </>
            ) : (
              <>
                The available IPV6 address range is{" "}
                <code>
                  {immutableIPV6}
                  {editableIPV6}
                </code>
              </>
            )}
            . If left empty, the address will be dynamically assigned.
          </>
        )
      }
      immutableText={isIPV4 ? `${immutableIPV4}.` : immutableIPV6}
      maxLength={maxLength}
      name={name}
      onPaste={handlePaste}
      value={inputValue}
      onChange={(e) => {
        setIp(e.target.value);
      }}
      placeholder={placeHolderText}
      {...props}
    />
  );
};

export default PrefixedIpInput;
