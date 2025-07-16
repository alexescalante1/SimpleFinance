import React, { useState, useEffect, useMemo, useRef } from "react";
import { View, ScrollView, Animated } from "react-native";
import {
  Modal,
  Portal,
  Text,
  TextInput,
  Button,
  Card,
  IconButton,
  Chip,
  Snackbar,
  HelperText,
  useTheme,
  Divider,
} from "react-native-paper";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { Transaction, TransactionDetail } from "@/domain/models/Transaction";
import {
  validateTransactionDetail,
  calculateDetailDiscrepancy,
} from "@/domain/valueObjects/TransactionVo";

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
    <Card style={{ marginBottom: 20, backgroundColor: theme.colors.surface }}>
      <Card.Content>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <View style={{ flex: 1, marginRight: 8 }}>
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
                <View style={{ marginBottom: 8 }}>
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
            iconColor="#F44336"
            onPress={() => onRemove(index)}
            disabled={disabled}
            style={{ marginTop: 4 }}
          />
        </View>
      </Card.Content>
    </Card>
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

  // Valores animados
  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    scaleValue.setValue(0.2);
    opacityValue.setValue(0);
    if (visible) {
      // Reiniciar antes de animar
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleValue, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

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
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleDismiss}
        dismissable={!loading}
        style={{ backgroundColor: "rgba(0, 0, 0, 0.85)" }} // 👈 Scrim más oscuro
        contentContainerStyle={{
          backgroundColor: theme.colors.surfaceVariant,
          margin: 20,
          borderRadius: 16,
          borderWidth: 1,
          maxHeight: "90%",
        }}
      >
        <Animated.View
          style={{
            transform: [{ scale: scaleValue }],
            opacity: opacityValue,
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: 16,
          }}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* <Card style={{ backgroundColor: theme.colors.surface }}> */}
            <Card.Content style={{ padding: 20, position: "relative" }}>
              {/* Botón de cerrar */}
              <View
                style={{ position: "absolute", top: 8, right: 8, zIndex: 1 }}
              >
                <IconButton
                  icon="close"
                  size={20}
                  onPress={handleDismiss}
                  disabled={loading}
                />
              </View>

              {/* Header */}
              <Text
                variant="headlineSmall"
                style={{
                  textAlign: "center",
                  marginBottom: 16,
                }}
              >
                Detalle de Transacción
              </Text>

              {/* Información de la transacción */}
              <Card
                style={{
                  marginBottom: 20,
                  backgroundColor: theme.colors.surface,
                }}
              >
                <Card.Content>
                  <View style={{ alignItems: "center" }}>
                    <Text
                      variant="titleLarge"
                      style={{
                        color:
                          transaction.type === "income" ? "#4CAF50" : "#F44336",
                        fontWeight: "bold",
                        marginBottom: 4,
                      }}
                    >
                      {transaction.type === "income" ? "+" : "-"}S/{" "}
                      {transaction.amount?.toFixed(2)}
                    </Text>

                    <Text
                      variant="bodyLarge"
                      style={{
                        textAlign: "center",
                        marginBottom: 4,
                      }}
                    >
                      {transaction.description || "Sin descripción"}
                    </Text>

                    <Text
                      variant="bodySmall"
                      style={{
                        textAlign: "center",
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
                </Card.Content>
              </Card>

              {/* Resumen de cálculos */}
              {calculations && (
                <Card
                  style={{
                    marginBottom: 20,
                    backgroundColor: theme.colors.surface,
                  }}
                >
                  <Card.Content>
                    <Text
                      variant="titleMedium"
                      style={{
                        textAlign: "center",
                        marginBottom: 12,
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
                      <Text variant="bodyMedium">Total detalles:</Text>
                      <Text variant="bodyMedium" style={{ fontWeight: "500" }}>
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
                      <Text variant="bodyMedium">Monto transacción:</Text>
                      <Text variant="bodyMedium" style={{ fontWeight: "500" }}>
                        S/ {transaction.amount.toFixed(2)}
                      </Text>
                    </View>

                    <Divider style={{ marginVertical: 8 }} />

                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text variant="bodyMedium">Diferencia:</Text>
                      <Text
                        variant="bodyMedium"
                        style={{
                          color: calculations.hasDiscrepancy
                            ? "#FF9800"
                            : "#4CAF50",
                          fontWeight: "bold",
                        }}
                      >
                        {calculations.hasDiscrepancy
                          ? `S/ ${Math.abs(calculations.discrepancy).toFixed(
                              2
                            )} ${
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
                          backgroundColor: "#fff3e027",
                          padding: 12,
                          borderRadius: 8,
                          marginTop: 12,
                        }}
                      >
                        <Text
                          variant="bodySmall"
                          style={{
                            color: "#FF9800",
                            textAlign: "center",
                            fontWeight: "500",
                          }}
                        >
                          ⚠️ Se agregará automáticamente un item "Desfase" al
                          guardar
                        </Text>
                      </View>
                    )}
                  </Card.Content>
                </Card>
              )}

              {/* Lista de detalles */}
              <View style={{ marginBottom: 20 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <Text variant="titleMedium">Detalles ({fields.length})</Text>
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
                  <Card
                    style={{
                      marginBottom: 20,
                      backgroundColor: theme.colors.surface,
                    }}
                  >
                    <Card.Content style={{ alignItems: "center", padding: 20 }}>
                      <Text
                        variant="bodyMedium"
                        style={{
                          textAlign: "center",
                        }}
                      >
                        No hay detalles agregados
                      </Text>
                      <Text
                        variant="bodySmall"
                        style={{
                          textAlign: "center",
                          marginTop: 4,
                          opacity: 0.7,
                        }}
                      >
                        Presiona "Agregar" para incluir el primer detalle
                      </Text>
                    </Card.Content>
                  </Card>
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
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Button
                  mode="contained"
                  onPress={handleDismiss}
                  style={{
                    flex: 1,
                    marginRight: 8,
                    backgroundColor: theme.colors.onErrorContainer,
                  }}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSubmit(onSubmit)}
                  loading={loading}
                  disabled={loading}
                  style={{
                    flex: 1,
                    marginLeft: 8,
                  }}
                  buttonColor="#4CAF50"
                  icon="content-save"
                >
                  {loading ? "Guardando..." : "Guardar"}
                </Button>
              </View>
            </Card.Content>
            {/* </Card> */}
          </ScrollView>
        </Animated.View>
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
      </Modal>
    </Portal>
  );
};
