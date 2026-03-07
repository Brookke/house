import {
  createFileRoute,
  useSearch,
  useNavigate,
} from "@tanstack/react-router";
import {
  Container,
  Title,
  Text,
  NumberInput,
  Paper,
  Stack,
  Group,
  Divider,
  RingProgress,
  Checkbox,
} from "@mantine/core";
import { useForm } from "@mantine/form";

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
  if (price < 100000) return 600;
  if (price < 250000) return 850;
  if (price < 500000) return 1100;
  if (price < 750000) return 1500;
  if (price < 1000000) return 2000;
  return 2500;
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
    (mortgageAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
    (Math.pow(1 + monthlyRate, numPayments) - 1);
  const totalUpfront = deposit + stampDuty + legalFees;
  const monthlyTotal =
    monthlyMortgage + serviceChargeYearly / 12 + groundRentYearly / 12;

  return (
    <Stack>
      <Paper>
        <Title order={3} mb="md">
          Upfront Costs
        </Title>
        <Stack>
          <Group justify="space-between">
            <Text>House Value</Text>
            <Text>£{houseValue.toLocaleString()}</Text>
          </Group>
          <Divider />
          <Group justify="space-between">
            <Text>Deposit ({depositPercent}%)</Text>
            <Text>£{deposit.toLocaleString()}</Text>
          </Group>
          <Group justify="space-between">
            <Text>Mortgage Amount</Text>
            <Text>£{mortgageAmount.toLocaleString()}</Text>
          </Group>
          <Divider />
          <Group justify="space-between">
            <Text>
              Stamp Duty{" "}
              {isFirstTimeBuyer && houseValue <= 500000 && "(First-time buyer)"}
            </Text>
            <Text>£{stampDuty.toLocaleString()}</Text>
          </Group>
          <Group justify="space-between">
            <Text>Legal Fees (est.)</Text>
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
      </Paper>

      <Paper>
        <Title order={3} mb="md">
          Monthly Payment
        </Title>
        <Group align="center" justify="space-between">
          <Stack>
            <Group justify="space-between">
              <Text>Mortgage</Text>
              <Text c="violet">
                £
                {monthlyMortgage.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </Text>
            </Group>
            <Group justify="space-between">
              <Text>Service Charge</Text>
              <Text c="blue">
                £
                {(serviceChargeYearly / 12).toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </Text>
            </Group>
            <Group justify="space-between">
              <Text>Ground Rent</Text>
              <Text c="orange">
                £
                {(groundRentYearly / 12).toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </Text>
            </Group>
            <Divider />
            <Group justify="space-between">
              <Text fw={700}>Total Monthly</Text>
              <Text fw={700}>
                £
                {monthlyTotal.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </Text>
            </Group>
          </Stack>
          <RingProgress
            size={240}
            thickness={25}
            sections={[
              {
                value:
                  monthlyTotal > 0 ? (monthlyMortgage / monthlyTotal) * 100 : 0,
                color: "violet",
              },
              {
                value:
                  monthlyTotal > 0
                    ? (serviceChargeYearly / 12 / monthlyTotal) * 100
                    : 0,
                color: "blue",
              },
              {
                value:
                  monthlyTotal > 0
                    ? (groundRentYearly / 12 / monthlyTotal) * 100
                    : 0,
                color: "orange",
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
        </Group>
      </Paper>
    </Stack>
  );
}

function Calculator() {
  const navigate = useNavigate({ from: "/" });
  const search = useSearch({ from: "/" });

  const form = useForm({
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
        search: {
          houseValue: values.houseValue || undefined,
          depositPercent: values.depositPercent || undefined,
          mortgageRate: values.mortgageRate || undefined,
          termYears: values.termYears || undefined,
          serviceChargeYearly: values.serviceChargeYearly || undefined,
          groundRentYearly: values.groundRentYearly || undefined,
          isFirstTimeBuyer: values.isFirstTimeBuyer ? true : false,
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
      <Title order={1} mb="md">
        House Cost Calculator
      </Title>
      <Text c="dimmed" mb="xl">
        Calculate the costs of buying a house including stamp duty, legal fees,
        and monthly payments.
      </Text>

      <Group align="flex-start" gap="lg">
        <Stack style={{ flex: 1, minWidth: 300 }}>
          <Paper>
            <Title order={3} mb="md">
              Property Details
            </Title>
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
          </Paper>

          <Paper>
            <Title order={3} mb="md">
              Ongoing Costs (Yearly)
            </Title>
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
          </Paper>
        </Stack>

        <div style={{ flex: 1, minWidth: 300 }}>
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
