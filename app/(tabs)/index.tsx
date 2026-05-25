import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Anak {
  id: string;
  nama: string;
  umur_bulan: number;
  tinggi_badan: number;
  berat_badan: number;
  created_at: string;
}

export default function HomeScreen() {
  const [data, setData] = useState<Anak[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nama, setNama] = useState("");
  const [umur, setUmur] = useState("");
  const [tinggi, setTinggi] = useState("");
  const [berat, setBerat] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const { data: anak, error } = await supabase
        .from("anak")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setData(anak || []);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setNama("");
    setUmur("");
    setTinggi("");
    setBerat("");
  };

  const handleEdit = (item: Anak) => {
    setEditingId(item.id);
    setNama(item.nama);
    setUmur(item.umur_bulan.toString());
    setTinggi(item.tinggi_badan.toString());
    setBerat(item.berat_badan.toString());
  };

  const handleDelete = async (id: string) => {
    try {
      console.log("DELETE ID:", id);

      const { error } = await supabase.from("anak").delete().eq("id", id);

      if (error) {
        console.log(error);
        Alert.alert("Error", error.message);
        return;
      }

      Alert.alert("Sukses", "Data berhasil dihapus");

      fetchData();
    } catch (error: any) {
      console.log(error);
    }
  };

  const handleSubmit = async () => {
    if (!nama || !umur || !tinggi || !berat) {
      Alert.alert("Peringatan", "Semua field harus diisi");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        nama,
        umur_bulan: parseInt(umur),
        tinggi_badan: parseFloat(tinggi),
        berat_badan: parseFloat(berat),
      };

      if (editingId) {
        console.log(
          "Attempting to update ID:",
          editingId,
          "with payload:",
          payload,
        );
        const { error, status, statusText } = await supabase
          .from("anak")
          .update(payload)
          .eq("id", editingId);

        console.log("Update Response:", { status, statusText, error });

        if (error) {
          Alert.alert(
            "Gagal Memperbarui",
            `Pesan: ${error.message}\nKode: ${error.code}\nStatus: ${status}`,
          );
          return;
        }
        Alert.alert("Sukses", "Data anak berhasil diperbarui");
      } else {
        const { error } = await supabase.from("anak").insert([payload]);
        if (error) throw error;
        Alert.alert("Sukses", "Data anak berhasil ditambahkan");
      }

      resetForm();
      fetchData();
    } catch (error: any) {
      Alert.alert("Error Simpan", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Modern Card Item
  const renderItem = ({ item }: { item: Anak }) => (
    <ThemedView style={styles.modernCard}>
      <View style={styles.cardTop}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={20} color="#0a7ea4" />
        </View>
        <View style={styles.nameContainer}>
          <ThemedText type="defaultSemiBold" style={styles.nameText}>
            {item.nama}
          </ThemedText>
          <ThemedText style={styles.dateText}>
            Dibuat: {new Date(item.created_at).toLocaleDateString("id-ID")}
          </ThemedText>
        </View>
        <View style={styles.actionRow}>
          <TouchableOpacity
            onPress={() => handleEdit(item)}
            style={styles.iconBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="pencil" size={20} color="#0a7ea4" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            style={[styles.iconBtn, { backgroundColor: "#fff5f5" }]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash" size={20} color="#ff4444" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <ThemedText style={styles.statValue}>{item.umur_bulan}</ThemedText>
          <ThemedText style={styles.statLabel}>Bulan</ThemedText>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <ThemedText style={styles.statValue}>{item.tinggi_badan}</ThemedText>
          <ThemedText style={styles.statLabel}>Tinggi (cm)</ThemedText>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <ThemedText style={styles.statValue}>{item.berat_badan}</ThemedText>
          <ThemedText style={styles.statLabel}>Berat (kg)</ThemedText>
        </View>
      </View>
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={
            <View style={styles.headerContent}>
              <ThemedText type="title" style={styles.mainTitle}>
                Cegah Stunting
              </ThemedText>

              {/* Form Card */}
              <View style={styles.formCard}>
                <View style={styles.formHeader}>
                  <Ionicons
                    name={editingId ? "create-outline" : "add-circle-outline"}
                    size={24}
                    color="#0a7ea4"
                  />
                  <ThemedText type="subtitle" style={styles.formTitle}>
                    {editingId ? "Edit Data Anak" : "Tambah Data Baru"}
                  </ThemedText>
                </View>

                <TextInput
                  style={styles.modernInput}
                  placeholder="Nama Anak"
                  placeholderTextColor="#999"
                  value={nama}
                  onChangeText={setNama}
                />

                <View style={styles.inputGrid}>
                  <View style={styles.inputGroup}>
                    <ThemedText style={styles.inputLabel}>
                      Umur (Bln)
                    </ThemedText>
                    <TextInput
                      style={styles.modernInputSmall}
                      placeholder="0"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                      value={umur}
                      onChangeText={setUmur}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <ThemedText style={styles.inputLabel}>
                      Tinggi (cm)
                    </ThemedText>
                    <TextInput
                      style={styles.modernInputSmall}
                      placeholder="0"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                      value={tinggi}
                      onChangeText={setTinggi}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <ThemedText style={styles.inputLabel}>
                      Berat (kg)
                    </ThemedText>
                    <TextInput
                      style={styles.modernInputSmall}
                      placeholder="0"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                      value={berat}
                      onChangeText={setBerat}
                    />
                  </View>
                </View>

                <View style={styles.buttonRow}>
                  {editingId && (
                    <TouchableOpacity
                      style={[styles.secondaryButton, { marginRight: 8 }]}
                      onPress={resetForm}
                    >
                      <ThemedText style={styles.secondaryButtonText}>
                        Batal
                      </ThemedText>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[
                      styles.primaryButton,
                      isSubmitting && { opacity: 0.7 },
                    ]}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Ionicons
                          name="save-outline"
                          size={18}
                          color="#fff"
                          style={{ marginRight: 6 }}
                        />
                        <ThemedText style={styles.primaryButtonText}>
                          {editingId ? "Perbarui Data" : "Simpan Data"}
                        </ThemedText>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.listHeader}>
                <ThemedText type="subtitle" style={styles.listTitle}>
                  Daftar Anak
                </ThemedText>
                <View style={styles.badge}>
                  <ThemedText style={styles.badgeText}>
                    {data.length} Total
                  </ThemedText>
                </View>
              </View>
            </View>
          }
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#0a7ea4"
            />
          }
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={48} color="#ccc" />
                <ThemedText style={styles.emptyText}>
                  Belum ada data tersedia
                </ThemedText>
              </View>
            ) : null
          }
        />
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerContent: {
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#0a7ea4",
    marginBottom: 24,
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 8,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  modernInput: {
    height: 50,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e9ecef",
    fontSize: 16,
    color: "#333",
  },
  inputGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  inputGroup: {
    flex: 0.3,
  },
  inputLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
    marginLeft: 4,
  },
  modernInputSmall: {
    height: 45,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
    fontSize: 15,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#0a7ea4",
    height: 50,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  secondaryButton: {
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: "#666",
    fontWeight: "600",
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  badge: {
    backgroundColor: "#e6f2f5",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    color: "#0a7ea4",
    fontWeight: "600",
  },
  modernCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e6f2f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  nameContainer: {
    flex: 1,
  },
  nameText: {
    fontSize: 18,
    color: "#333",
  },
  dateText: {
    fontSize: 11,
    color: "#999",
    marginTop: 2,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
  },
  iconBtn: {
    padding: 8,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    paddingVertical: 12,
    justifyContent: "space-around",
  },
  statBox: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  statLabel: {
    fontSize: 10,
    color: "#888",
    marginTop: 2,
    textTransform: "uppercase",
  },
  statDivider: {
    width: 1,
    height: "60%",
    backgroundColor: "#ddd",
    alignSelf: "center",
  },
  emptyState: {
    alignItems: "center",
    marginTop: 60,
    opacity: 0.5,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
  },
});
