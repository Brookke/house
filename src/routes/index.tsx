import {
  Card,
  Checkbox,
  Container,
  Divider,
  Group,
  NumberInput,
  RingProgress,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconBuildingCommunity,
  IconBuildingEstate,
  IconCalendar,
  IconCalendarMonth,
  IconCalendarRepeat,
  IconCash,
  IconCoins,
  IconHome,
  IconPercentage,
  IconPigMoney,
  IconReceipt,
  IconScale,
  IconSeeding,
} from "@tabler/icons-react";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      houseValue: Number(search.houseValue) || undefined,
      depositPercent: Number(search.depositPercent) || undefined,
      mortgageRate: Number(search.mortgageRate) || undefined,
      termYears: Number(search.termYears) || undefined,
      serviceChargeYearly: Number(search.serviceChargeYearly) || undefined,
      groundRentYearly: Number(search.groundRentYearly) || undefined,
      isFirstTimeBuyer: search.isFirstTimeBuyer === true,
    };
  },
  component: Calculator,
});

const STANDARD_STAMP_DUTY_RATES = [
  { threshold: 125000, rate: 0 },
  { threshold: 250000, rate: 0.02 },
  { threshold: 925000, rate: 0.05 },
  { threshold: 1500000, rate: 0.1 },
  { threshold: Infinity, rate: 0.12 },
];

const FIRST_TIME_BUYER_RATES = [
  { threshold: 300000, rate: 0 },
  { threshold: 500000, rate: 0.05 },
  { threshold: Infinity, rate: 0.05 },
];

function calculateStampDuty(price: number, isFirstTimeBuyer: boolean): number {
  if (isFirstTimeBuyer && price > 500000) {
    isFirstTimeBuyer = false;
  }

  const rates = isFirstTimeBuyer
    ? FIRST_TIME_BUYER_RATES
    : STANDARD_STAMP_DUTY_RATES;
  let remaining = price;
  let total = 0;
  let prevThreshold = 0;

  for (const { threshold, rate } of rates) {
    if (remaining <= 0) break;
    const bandSize = threshold - prevThreshold;
    const taxableInBand = Math.min(remaining, bandSize);
    total += taxableInBand * rate;
    remaining -= taxableInBand;
    prevThreshold = threshold;
  }

  return Math.round(total);
}
function calculateLegalFees(price: number): number {
  // UK conveyancing fees (Legal Fee + 20% VAT + £600 Average Disbursements)
  if (price < 100000) return 1800;
  if (price < 250000) return 2100;
  if (price < 500000) return 2500;
  if (price < 750000) return 3000;
  if (price < 1000000) return 3900;
  return 5400;
}
interface CalculatorResultsProps {
  houseValue: number;
  depositPercent: number;
  mortgageRate: number;
  termYears: number;
  serviceChargeYearly: number;
  groundRentYearly: number;
  isFirstTimeBuyer: boolean;
  stampDuty: number;
  legalFees: number;
}

function CalculatorResults({
  houseValue,
  depositPercent,
  mortgageRate,
  termYears,
  serviceChargeYearly,
  groundRentYearly,
  isFirstTimeBuyer,
  stampDuty,
  legalFees,
}: CalculatorResultsProps) {
  const deposit = houseValue * (depositPercent / 100);
  const mortgageAmount = houseValue - deposit;
  const monthlyRate = mortgageRate / 100 / 12;
  const numPayments = termYears * 12;
  const monthlyMortgage =
    (mortgageAmount * (monthlyRate * (1 + monthlyRate) ** numPayments)) /
    ((1 + monthlyRate) ** numPayments - 1);
  const totalUpfront = deposit + stampDuty + legalFees;
  const monthlyTotal =
    monthlyMortgage + serviceChargeYearly / 12 + groundRentYearly / 12;

  return (
    <Stack>
      <Card>
        <Group gap="sm" mb="md">
          <IconCoins size={24} color="var(--mantine-color-green-6)" />
          <Title order={3}>Upfront Costs</Title>
        </Group>
        <Stack>
          <Group justify="space-between">
            <Group gap="xs">
              <IconBuildingEstate
                size={18}
                color="var(--mantine-color-dimmed)"
              />
              <Text>House Value</Text>
            </Group>
            <Text>£{houseValue.toLocaleString()}</Text>
          </Group>
          <Divider />
          <Group justify="space-between">
            <Group gap="xs">
              <IconPigMoney size={18} color="var(--mantine-color-dimmed)" />
              <Text>Deposit ({depositPercent}%)</Text>
            </Group>
            <Text>£{deposit.toLocaleString()}</Text>
          </Group>
          <Group justify="space-between">
            <Group gap="xs">
              <IconCash size={18} color="var(--mantine-color-dimmed)" />
              <Text>Mortgage Amount</Text>
            </Group>
            <Text>£{mortgageAmount.toLocaleString()}</Text>
          </Group>
          <Divider />
          <Group justify="space-between">
            <Group gap="xs">
              <IconReceipt size={18} color="var(--mantine-color-dimmed)" />
              <Text>
                Stamp Duty{" "}
                {isFirstTimeBuyer &&
                  houseValue <= 500000 &&
                  "(First-time buyer)"}
              </Text>
            </Group>
            <Text>£{stampDuty.toLocaleString()}</Text>
          </Group>
          <Group justify="space-between">
            <Group gap="xs">
              <IconScale size={18} color="var(--mantine-color-dimmed)" />
              <Text>Legal Fees (est.)</Text>
            </Group>
            <Text>£{legalFees.toLocaleString()}</Text>
          </Group>
          <Divider />
          <Group justify="space-between">
            <Text fw={700}>Total Upfront Costs</Text>
            <Text fw={700} size="lg">
              £{totalUpfront.toLocaleString()}
            </Text>
          </Group>
        </Stack>
      </Card>

      <Card>
        <Group gap="sm" mb="md">
          <IconCalendarMonth size={24} color="var(--mantine-color-violet-6)" />
          <Title order={3}>Monthly Payment</Title>
        </Group>
        <Group align="center" justify="center" gap="md">
          <RingProgress
            thickness={32}
            size={260}
            sections={[
              {
                value:
                  monthlyTotal > 0 ? (monthlyMortgage / monthlyTotal) * 100 : 0,
                color: "violet",
                tooltip: `${((monthlyMortgage / monthlyTotal) * 100).toFixed(1)}% mortgage`,
              },
              {
                value:
                  monthlyTotal > 0
                    ? (serviceChargeYearly / 12 / monthlyTotal) * 100
                    : 0,
                color: "blue",
                tooltip: `${((serviceChargeYearly / 12 / monthlyTotal) * 100).toFixed(1)}% service charge`,
              },
              {
                value:
                  monthlyTotal > 0
                    ? (groundRentYearly / 12 / monthlyTotal) * 100
                    : 0,
                color: "orange",
                tooltip: `${((groundRentYearly / 12 / monthlyTotal) * 100).toFixed(1)}% ground rent`,
              },
            ]}
            label={
              <Stack align="center" gap={0}>
                <Text ta="center" fw={700} size="md">
                  {monthlyTotal > 0
                    ? ((monthlyMortgage / monthlyTotal) * 100).toFixed(0)
                    : 0}
                  %
                </Text>
                <Text span size="sm" c="dimmed">
                  {" "}
                  mortgage
                </Text>
              </Stack>
            }
          />
          <Stack flex={1} miw={180}>
            <Group justify="space-between">
              <Group gap="xs">
                <IconPercentage
                  size={18}
                  color="var(--mantine-color-violet-6)"
                />
                <Text>Mortgage</Text>
              </Group>
              <Text c="violet">
                £
                {monthlyMortgage.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </Text>
            </Group>
            <Group justify="space-between">
              <Group gap="xs">
                <IconBuildingCommunity
                  size={18}
                  color="var(--mantine-color-blue-6)"
                />
                <Text>Service Charge</Text>
              </Group>
              <Text c="blue">
                £
                {(serviceChargeYearly / 12).toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </Text>
            </Group>
            <Group justify="space-between">
              <Group gap="xs">
                <IconSeeding size={18} color="var(--mantine-color-orange-6)" />
                <Text>Ground Rent</Text>
              </Group>
              <Text c="orange">
                £
                {(groundRentYearly / 12).toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </Text>
            </Group>
            <Divider />
            <Group justify="space-between">
              <Group gap="xs">
                <IconCalendar size={18} />
                <Text fw={700}>Total Monthly</Text>
              </Group>
              <Text fw={700}>
                £
                {monthlyTotal.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </Text>
            </Group>
          </Stack>
        </Group>
      </Card>
    </Stack>
  );
}

function Calculator() {
  const navigate = useNavigate({ from: "/" });
  const search = useSearch({ from: "/", structuralSharing: true });

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      houseValue: Number(search.houseValue) || 500000,
      depositPercent: Number(search.depositPercent) || 10,
      mortgageRate: Number(search.mortgageRate) || 4.5,
      termYears: Number(search.termYears) || 30,
      serviceChargeYearly: Number(search.serviceChargeYearly) || 0,
      groundRentYearly: Number(search.groundRentYearly) || 0,
      isFirstTimeBuyer: search.isFirstTimeBuyer ?? false,
    },
    onValuesChange: (values) => {
      navigate({
        replace: true,
        resetScroll: false,
        search: {
          houseValue: values.houseValue || undefined,
          depositPercent: values.depositPercent || undefined,
          mortgageRate: values.mortgageRate || undefined,
          termYears: values.termYears || undefined,
          serviceChargeYearly: values.serviceChargeYearly || undefined,
          groundRentYearly: values.groundRentYearly || undefined,
          isFirstTimeBuyer: !!values.isFirstTimeBuyer,
        },
      });
    },
  });

  const {
    houseValue,
    depositPercent,
    mortgageRate,
    termYears,
    serviceChargeYearly,
    groundRentYearly,
    isFirstTimeBuyer,
  } = form.values;

  const stampDuty = calculateStampDuty(houseValue, isFirstTimeBuyer);
  const legalFees = calculateLegalFees(houseValue);

  return (
    <Container size="xl" py="xl">
      <Group gap="sm" mb="md">
        <ThemeIcon size="xl" variant="light" color="violet">
          <IconHome size={28} />
        </ThemeIcon>
        <Title order={1}>House Cost Calculator</Title>
      </Group>
      <Text c="dimmed" mb="xl">
        Get a rough idea of house buying costs including stamp duty, legal fees,
        and monthly payments. Estimates are for guidance only - always verify
        with a solicitor or mortgage adviser. Data is for England as of March
        2026.
      </Text>

      <Group align="flex-start" gap="lg">
        <Stack style={{ flex: 1, minWidth: 300 }}>
          <Card>
            <Group gap="sm" mb="md">
              <IconBuildingEstate
                size={24}
                color="var(--mantine-color-blue-6)"
              />
              <Title order={3}>Property Details</Title>
            </Group>
            <Group grow>
              <NumberInput
                label="House Value"
                {...form.getInputProps("houseValue")}
                thousandSeparator=","
                prefix="£"
                min={0}
                step={50000}
              />
              <NumberInput
                label="Deposit (%)"
                {...form.getInputProps("depositPercent")}
                min={0}
                max={100}
                suffix="%"
                step={5}
              />
            </Group>
            <Checkbox
              label="First-time buyer"
              {...form.getInputProps("isFirstTimeBuyer", { type: "checkbox" })}
              mt="md"
            />
          </Card>

          <Card>
            <Group gap="sm" mb="md">
              <IconCalendarRepeat
                size={24}
                color="var(--mantine-color-teal-6)"
              />
              <Title order={3}>Ongoing Costs (Yearly)</Title>
            </Group>
            <Group grow>
              <NumberInput
                label="Mortgage Rate (%)"
                {...form.getInputProps("mortgageRate")}
                min={0}
                max={20}
                suffix="%"
                step={0.1}
              />
              <NumberInput
                label="Term (years)"
                {...form.getInputProps("termYears")}
                min={1}
                max={40}
                step={5}
              />
            </Group>
            <Group grow mt="md">
              <NumberInput
                label="Service Charge"
                {...form.getInputProps("serviceChargeYearly")}
                thousandSeparator=","
                prefix="£"
                min={0}
                suffix="/yr"
                step={500}
              />
              <NumberInput
                label="Ground Rent"
                {...form.getInputProps("groundRentYearly")}
                thousandSeparator=","
                prefix="£"
                min={0}
                suffix="/yr"
                step={100}
              />
            </Group>
          </Card>
        </Stack>

        <div style={{ flex: 1, minWidth: 350 }}>
          <CalculatorResults
            houseValue={houseValue}
            depositPercent={depositPercent}
            mortgageRate={mortgageRate}
            termYears={termYears}
            serviceChargeYearly={serviceChargeYearly}
            groundRentYearly={groundRentYearly}
            isFirstTimeBuyer={isFirstTimeBuyer}
            stampDuty={stampDuty}
            legalFees={legalFees}
          />
        </div>
      </Group>
    </Container>
  );
}
