import React, { useState, useEffect, useMemo } from "react";
import { View, ScrollView } from "react-native";
import {
  Text,
  TextInput,
  Button,
  Card,
  Chip,
  Snackbar,
  HelperText,
  useTheme,
  Divider,
  IconButton,
} from "react-native-paper";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { Transaction, TransactionDetail } from "@/domain/models/Transaction";
import {
  validateTransactionDetail,
  calculateDetailDiscrepancy,
} from "@/domain/valueObjects/TransactionVo";
import { AnimatedDialog } from "./AnimatedDialog"; // Ajusta la ruta según tu estructura

interface TransactionDetailModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSave: (transactionId: string, detail: TransactionDetail[]) => Promise<void>;
  transaction: Transaction | null;
  loading: boolean;
}

interface DetailFormData {
  details: TransactionDetail[];
}

interface DetailItemProps {
  detail: TransactionDetail;
  index: number;
  onRemove: (index: number) => void;
  control: any;
  errors: any;
  disabled: boolean;
}

const DetailItem: React.FC<DetailItemProps> = ({
  detail,
  index,
  onRemove,
  control,
  errors,
  disabled,
}) => {
  const theme = useTheme();
  
  return (
    <View style={{
      backgroundColor: theme.colors.surfaceVariant,
      padding: 16,
      borderRadius: 12,
      marginBottom: 16,
    }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <View style={{ flex: 1, marginRight: 12 }}>
          <Controller
            control={control}
            name={`details.${index}.amount`}
            rules={{
              validate: (value) => {
                const error = validateTransactionDetail({
                  amount: parseFloat(value) || 0,
                  description: "temp",
                });
                if (error && error.includes("monto")) return error;
                return true;
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={{ marginBottom: 16 }}>
                <TextInput
                  label="Monto (S/)"
                  value={value?.toString() || ""}
                  onChangeText={(text) => {
                    const cleanText = text.replace(/[^0-9.]/g, "");
                    const parts = cleanText.split(".");
                    if (parts.length > 2) return;
                    onChange(parseFloat(cleanText) || 0);
                  }}
                  onBlur={onBlur}
                  mode="outlined"
                  keyboardType="numeric"
                  dense
                  error={!!errors?.details?.[index]?.amount}
                  disabled={disabled}
                  placeholder="0.00"
                />
                <HelperText
                  type="error"
                  visible={!!errors?.details?.[index]?.amount}
                >
                  {errors?.details?.[index]?.amount?.message}
                </HelperText>
              </View>
            )}
          />

          <Controller
            control={control}
            name={`details.${index}.description`}
            rules={{
              validate: (value) => {
                const error = validateTransactionDetail({
                  amount: 1,
                  description: value,
                });
                if (error && error.includes("descripción")) return error;
                return true;
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <TextInput
                  label="Descripción"
                  value={value || ""}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  mode="outlined"
                  dense
                  error={!!errors?.details?.[index]?.description}
                  disabled={disabled}
                  placeholder="¿En qué se gastó/ganó?"
                />
                <HelperText
                  type="error"
                  visible={!!errors?.details?.[index]?.description}
                >
                  {errors?.details?.[index]?.description?.message}
                </HelperText>
              </View>
            )}
          />
        </View>

        <IconButton
          icon="delete"
          size={20}
          iconColor={theme.colors.error}
          onPress={() => onRemove(index)}
          disabled={disabled}
          style={{ marginTop: 4 }}
        />
      </View>
    </View>
  );
};

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  visible,
  onDismiss,
  onSave,
  transaction,
  loading,
}) => {
  const theme = useTheme();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<DetailFormData>({
    defaultValues: {
      details: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "details",
  });

  const watchedDetails = watch("details");

  // Calcular totales y desfase
  const calculations = useMemo(() => {
    if (!transaction || !watchedDetails) return null;

    const totalDetailAmount = watchedDetails.reduce((sum, detail) => {
      return sum + (parseFloat(detail.amount?.toString() || "0") || 0);
    }, 0);

    const discrepancy = transaction.amount - totalDetailAmount;
    const hasDiscrepancy = Math.abs(discrepancy) > 0.01;

    return {
      totalDetailAmount,
      discrepancy,
      hasDiscrepancy,
      discrepancyType: discrepancy > 0 ? "positive" : "negative",
    };
  }, [transaction, watchedDetails]);

  // Efecto para cargar datos cuando se abre el modal
  useEffect(() => {
    if (visible && transaction) {
      const initialDetails =
        transaction.detail?.length > 0
          ? transaction.detail.map((detail) => ({
              amount: detail.amount,
              description: detail.description,
            }))
          : [];

      reset({ details: initialDetails });
    }
  }, [visible, transaction, reset]);

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const addNewDetail = () => {
    append({ amount: 0, description: "" });
  };

  const removeDetail = (index: number) => {
    remove(index);
  };

  const onSubmit = async (data: DetailFormData) => {
    if (!transaction) return;

    try {
      // Validar que todos los detalles sean válidos
      const validDetails = data.details.filter((detail) => {
        const amount = parseFloat(detail.amount?.toString() || "0");
        return amount > 0 && detail.description?.trim();
      });

      // Si hay desfase, agregar automáticamente el item de desfase
      let finalDetails = [...validDetails];

      if (calculations?.hasDiscrepancy) {
        const discrepancyDetail = calculateDetailDiscrepancy(
          transaction.amount,
          validDetails
        );
        if (discrepancyDetail) {
          finalDetails.push(discrepancyDetail);
        }
      }

      await onSave(transaction.id, finalDetails);
      showSnackbar("¡Detalle guardado correctamente!");

      setTimeout(() => {
        onDismiss();
      }, 100);
    } catch (error: any) {
      console.error("Error al guardar detalle:", error);
      showSnackbar(error.message || "Error al guardar el detalle");
    }
  };

  const handleDismiss = () => {
    if (!loading) {
      reset();
      onDismiss();
    }
  };

  const formatDate = (createdAt: any): string => {
    try {
      if (!createdAt || !createdAt.toDate) return "Fecha no disponible";
      const date: Date = createdAt.toDate();
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      return "Fecha inválida";
    }
  };

  if (!transaction) return null;

  return (
    <>
      <AnimatedDialog
        visible={visible}
        onDismiss={handleDismiss}
        dismissable={!loading}
        showCloseButton={true}
        scrimOpacity={0.85}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          style={{ maxHeight: 600 }} // Altura máxima para el scroll
        >
          {/* Header */}
          <View style={{ marginTop: 16, marginBottom: 24 }}>
            <Text
              variant="headlineSmall"
              style={{
                textAlign: "center",
                fontWeight: "600",
                color: theme.colors.onSurface,
              }}
            >
              Detalle de Transacción
            </Text>
          </View>

          {/* Información de la transacción */}
          <View style={{
            backgroundColor: theme.colors.surface,
            padding: 20,
            borderRadius: 12,
            marginBottom: 20,
          }}>
            <View style={{ alignItems: "center" }}>
              <Text
                variant="headlineMedium"
                style={{
                  color: transaction.type === "income" ? "#4CAF50" : "#F44336",
                  fontWeight: "bold",
                  marginBottom: 8,
                }}
              >
                {transaction.type === "income" ? "+" : "-"}S/{" "}
                {transaction.amount?.toFixed(2)}
              </Text>
              
              <Text
                variant="bodyLarge"
                style={{
                  textAlign: "center",
                  color: theme.colors.onSurface,
                  marginBottom: 4,
                }}
              >
                {transaction.description || "Sin descripción"}
              </Text>

              <Text
                variant="bodySmall"
                style={{
                  textAlign: "center",
                  color: theme.colors.onSurfaceVariant,
                  marginBottom: 8,
                }}
              >
                {formatDate(transaction.createdAt)}
              </Text>

              {transaction.isRegularization && (
                <Chip
                  mode="outlined"
                  style={{ marginTop: 8 }}
                  textStyle={{ fontSize: 10 }}
                >
                  🔄 Regularización
                </Chip>
              )}
            </View>
          </View>

          {/* Resumen de cálculos */}
          {calculations && (
            <View style={{
              backgroundColor: theme.colors.surface,
              padding: 16,
              borderRadius: 12,
              marginBottom: 20,
            }}>
              <Text
                variant="titleMedium"
                style={{
                  textAlign: "center",
                  marginBottom: 16,
                  color: theme.colors.onSurface,
                }}
              >
                Resumen
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                  Total detalles:
                </Text>
                <Text variant="bodyMedium" style={{ fontWeight: "500", color: theme.colors.onSurface }}>
                  S/ {calculations.totalDetailAmount.toFixed(2)}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                  Monto transacción:
                </Text>
                <Text variant="bodyMedium" style={{ fontWeight: "500", color: theme.colors.onSurface }}>
                  S/ {transaction.amount.toFixed(2)}
                </Text>
              </View>

              <Divider style={{ marginVertical: 12 }} />

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: calculations.hasDiscrepancy ? 12 : 0,
                }}
              >
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                  Diferencia:
                </Text>
                <Text
                  variant="bodyMedium"
                  style={{
                    color: calculations.hasDiscrepancy ? "#FF9800" : "#4CAF50",
                    fontWeight: "bold",
                  }}
                >
                  {calculations.hasDiscrepancy
                    ? `S/ ${Math.abs(calculations.discrepancy).toFixed(2)} ${
                        calculations.discrepancyType === "positive"
                          ? "(faltante)"
                          : "(sobrante)"
                      }`
                    : "Sin diferencia ✓"}
                </Text>
              </View>

              {calculations.hasDiscrepancy && (
                <View
                  style={{
                    backgroundColor: theme.colors.secondaryContainer,
                    padding: 12,
                    borderRadius: 8,
                  }}
                >
                  <Text
                    variant="bodySmall"
                    style={{
                      color: theme.colors.onSecondaryContainer,
                      textAlign: "center",
                      fontWeight: "500",
                    }}
                  >
                    ⚠️ Se agregará automáticamente un item "Desfase" al guardar
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Lista de detalles */}
          <View style={{ marginBottom: 24 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                Detalles ({fields.length})
              </Text>
              <Button
                mode="contained-tonal"
                icon="plus"
                onPress={addNewDetail}
                disabled={loading}
                compact
              >
                Agregar
              </Button>
            </View>

            {fields.length === 0 ? (
              <View style={{
                backgroundColor: theme.colors.surface,
                padding: 20,
                borderRadius: 12,
                alignItems: "center",
              }}>
                <Text
                  variant="bodyMedium"
                  style={{
                    textAlign: "center",
                    color: theme.colors.onSurface,
                  }}
                >
                  No hay detalles agregados
                </Text>
                <Text
                  variant="bodySmall"
                  style={{
                    textAlign: "center",
                    marginTop: 4,
                    color: theme.colors.onSurfaceVariant,
                    opacity: 0.7,
                  }}
                >
                  Presiona "Agregar" para incluir el primer detalle
                </Text>
              </View>
            ) : (
              fields.map((field, index) => (
                <DetailItem
                  key={field.id}
                  detail={watchedDetails[index]}
                  index={index}
                  onRemove={removeDetail}
                  control={control}
                  errors={errors}
                  disabled={loading}
                />
              ))
            )}
          </View>

          {/* Botones */}
          <View style={{ 
            flexDirection: "row", 
            gap: 12,
          }}>
            <Button
              mode="outlined"
              onPress={handleDismiss}
              style={{ flex: 1 }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              disabled={loading}
              style={{ flex: 1 }}
              buttonColor={theme.colors.primary}
              icon="content-save"
            >
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </View>
        </ScrollView>
      </AnimatedDialog>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: "OK",
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </>
  );
};