<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { donationApi, donationConfirmationApi } from "@/api/client";
import type { DonationStats } from "@/api/client";

interface Donation {
  id: number;
  amount: string;
  currency: string;
  donation_type: string;
  payment_method: number | null;
  payment_method_code: string;
  phone: string;
  status: string;
  external_reference: string;
  transaction_reference: string;
  payment_id: string;
  payment_link_id: string;
  initiation_channel: string;
  confirmed: boolean;
  donor_name: string;
  donor_email: string;
  created_at: string;
  updated_at: string;
}

interface DonationConfirmationPayloadData {
  amount?: string;
  currency?: string;
  provider?: string;
  status?: string;
  payment_id?: string;
  merchant_reference?: string;
}

interface DonationConfirmationPayload {
  data?: DonationConfirmationPayloadData;
}

interface DonationConfirmation {
  id: number;
  event_id: string;
  event_type: string;
  received_at: string;
  timestamp: string;
  duplicate: boolean;
  payload: DonationConfirmationPayload;
  donation: number | null;
  processed: boolean;
  created_at: string;
}

const items = ref<Donation[]>([]);
const folder = ref("all");
const query = ref("");
const error = ref("");
const statusMsg = ref("");
const loading = ref(true);
const saving = ref(false);
const selected = ref<Donation | null>(null);
const confirmations = ref<DonationConfirmation[]>([]);
const loadingConfirmations = ref(false);
const detailOpen = ref(false);
const editDialogOpen = ref(false);
const editForm = ref({
  status: "",
  confirmed: false,
  donor_name: "",
  donor_email: "",
});
const deleteConfirmOpen = ref(false);
const stats = ref<DonationStats | null>(null);

const statusFilters = [
  { id: "all", label: "All", icon: "payments" },
  { id: "success", label: "Success", icon: "check_circle" },
  { id: "pending", label: "Pending", icon: "schedule" },
  { id: "failed", label: "Failed", icon: "cancel" },
];

const visible = computed(() => {
  let list = items.value;
  if (folder.value !== "all") {
    list = list.filter((i) => i.status === folder.value);
  }
  const q = query.value.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (i) =>
        i.donor_name?.toLowerCase().includes(q) ||
        i.donor_email?.toLowerCase().includes(q) ||
        i.transaction_reference?.toLowerCase().includes(q) ||
        i.payment_id?.toLowerCase().includes(q) ||
        i.external_reference?.toLowerCase().includes(q),
    );
  }
  return list;
});

const pendingCount = computed(() => stats.value?.pending ?? 0);
const successCount = computed(() => stats.value?.successful ?? 0);
const totalAmount = computed(() =>
  formatAmount(stats.value?.confirmed_total || "0"),
);

const tableColumns = [
  { key: "donor_name", label: "Donor", sortable: true },
  { key: "amount", label: "Amount", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "donation_type", label: "Type", sortable: true },
  { key: "confirmed", label: "Confirmed", sortable: true },
  { key: "created_at", label: "Date", sortable: true },
  { key: "actions", label: "", width: "40px" },
];

const tableRows = computed(() =>
  visible.value.map((item) => ({
    id: item.id,
    donor_name: item.donor_name || "Anonymous",
    amount: formatAmount(item.amount, item.currency),
    status: item.status,
    donation_type: item.donation_type === "monthly" ? "Monthly" : "One-time",
    confirmed: item.confirmed,
    created_at: formatListDate(item.created_at),
    _raw: item,
  })),
);

async function load() {
  loading.value = true;
  error.value = "";
  try {
    const [data, statsData] = await Promise.all([
      donationApi.list("ordering=-created_at"),
      donationApi.stats(),
    ]);
    const listResult = data as { results?: Donation[] } | Donation[];
    items.value =
      (listResult as { results?: Donation[] }).results ||
      (listResult as Donation[]);
    stats.value = statsData;
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : "Failed to load donations";
  } finally {
    loading.value = false;
  }
}

async function loadConfirmations(donationId: number) {
  loadingConfirmations.value = true;
  try {
    const data = await donationConfirmationApi.list(
      `donation=${donationId}&ordering=-created_at`,
    );
    const result = data as
      | { results?: DonationConfirmation[] }
      | DonationConfirmation[];
    confirmations.value =
      (result as { results?: DonationConfirmation[] }).results ||
      (result as DonationConfirmation[]);
  } catch {
    confirmations.value = [];
  } finally {
    loadingConfirmations.value = false;
  }
}

const confirmationColumns = [
  { key: "event_type", label: "Event Type" },
  { key: "provider", label: "Provider" },
  { key: "amount", label: "Amount" },
  { key: "payment_id", label: "Payment ID" },
  { key: "status", label: "Status" },
  { key: "received_at", label: "Received" },
];

const confirmationRows = computed(() =>
  confirmations.value.map((conf) => {
    const data = conf.payload?.data || {};
    return {
      id: conf.id,
      event_type: conf.event_type,
      provider: data.provider || "—",
      amount: data.amount ? formatAmount(data.amount, data.currency) : "—",
      payment_id: data.payment_id || "—",
      processed: conf.processed,
      duplicate: conf.duplicate,
      received_at: formatFullDate(conf.received_at),
      event_id: conf.event_id,
    };
  }),
);

function formatListDate(value: string): string {
  try {
    const d = new Date(value);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      });
    }
    const sameYear = d.getFullYear() === now.getFullYear();
    return d.toLocaleDateString(
      undefined,
      sameYear
        ? { month: "short", day: "numeric" }
        : { month: "short", day: "numeric", year: "numeric" },
    );
  } catch {
    return value;
  }
}

function formatFullDate(value: string): string {
  try {
    return new Date(value).toLocaleString(undefined, {
      dateStyle: "full",
      timeStyle: "short",
    });
  } catch {
    return value;
  }
}

function formatAmount(amount: string, _currency?: string): string {
  const num = parseFloat(amount || "0");
  const formatted = num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `${formatted} TSh`;
}

function initials(name: string): string {
  return String(name || "?")
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("");
}

function selectFolder(id: string) {
  folder.value = id;
  selected.value = null;
  detailOpen.value = false;
  statusMsg.value = "";
}

async function openDetail(item: Donation) {
  selected.value = item;
  detailOpen.value = true;
  statusMsg.value = "";
  confirmations.value = [];
  await loadConfirmations(item.id);
}

function closeDetail() {
  detailOpen.value = false;
}

function onRowClick(e: { item: { _raw: Donation } }) {
  openDetail(e.item._raw);
}

function openEdit() {
  if (!selected.value) return;
  editForm.value = {
    status: selected.value.status,
    confirmed: selected.value.confirmed,
    donor_name: selected.value.donor_name,
    donor_email: selected.value.donor_email,
  };
  editDialogOpen.value = true;
}

async function saveEdit() {
  if (!selected.value) return;
  saving.value = true;
  error.value = "";
  try {
    const updated = (await donationApi.update(selected.value.id, {
      status: editForm.value.status,
      confirmed: editForm.value.confirmed,
      donor_name: editForm.value.donor_name,
      donor_email: editForm.value.donor_email,
    })) as Donation;
    const idx = items.value.findIndex((i) => i.id === updated.id);
    if (idx >= 0) items.value[idx] = updated;
    selected.value = updated;
    editDialogOpen.value = false;
    statusMsg.value = "Donation updated";
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : "Failed to update donation";
  } finally {
    saving.value = false;
  }
}

function openDelete() {
  deleteConfirmOpen.value = true;
}

async function confirmDelete() {
  if (!selected.value) return;
  saving.value = true;
  error.value = "";
  try {
    await donationApi.remove(selected.value.id);
    items.value = items.value.filter((i) => i.id !== selected.value!.id);
    selected.value = null;
    deleteConfirmOpen.value = false;
    detailOpen.value = false;
    statusMsg.value = "Donation deleted";
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : "Failed to delete donation";
  } finally {
    saving.value = false;
  }
}

watch(folder, () => {
  if (
    selected.value &&
    !visible.value.find((i) => i.id === selected.value!.id)
  ) {
    selected.value = null;
    detailOpen.value = false;
  }
});

onMounted(load);
</script>

<template>
  <div class="donations-page">
    <div class="page-header">
      <div>
        <h1>Donations</h1>
        <p class="subtitle">Track and manage incoming donations from PayIt</p>
      </div>
      <button type="button" class="refresh-btn" @click="load">
        <VaIcon name="refresh" size="18px" />
        Refresh
      </button>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <span class="stat-value">{{ stats?.total_donations ?? 0 }}</span>
        <span class="stat-label">Total Donations</span>
      </div>
      <div class="stat-card success">
        <span class="stat-value">{{ successCount }}</span>
        <span class="stat-label">Successful</span>
      </div>
      <div class="stat-card pending">
        <span class="stat-value">{{ pendingCount }}</span>
        <span class="stat-label">Pending</span>
      </div>
      <div class="stat-card amount">
        <span class="stat-value">{{ totalAmount }}</span>
        <span class="stat-label">Confirmed Total</span>
      </div>
    </div>

    <div class="toolbar-row">
      <div class="filter-tabs">
        <button
          v-for="f in statusFilters"
          :key="f.id"
          type="button"
          class="filter-tab"
          :class="{ active: folder === f.id }"
          @click="selectFolder(f.id)"
        >
          <VaIcon :name="f.icon" size="16px" />
          {{ f.label }}
          <span
            v-if="
              f.id !== 'all' && items.filter((i) => i.status === f.id).length
            "
            class="tab-count"
          >
            {{ items.filter((i) => i.status === f.id).length }}
          </span>
        </button>
      </div>
      <div class="search-box">
        <VaIcon name="search" size="18px" color="#5b6b82" />
        <input
          v-model="query"
          type="search"
          placeholder="Search donor, ref, payment ID…"
          aria-label="Search donations"
        />
      </div>
    </div>

    <p v-if="error" class="banner error">{{ error }}</p>
    <p v-if="statusMsg" class="banner ok">{{ statusMsg }}</p>

    <div class="table-card">
      <div v-if="loading" class="table-loading">
        <VaProgressCircle indeterminate size="small" />
        Loading…
      </div>
      <div v-else-if="!visible.length" class="table-empty">
        <VaIcon name="payments" size="48px" color="#c5cedc" />
        <p>
          No donations in
          {{
            statusFilters.find((f) => f.id === folder)?.label || "this view"
          }}.
        </p>
      </div>
      <VaDataTable
        v-else
        class="donations-table"
        :items="tableRows"
        :columns="tableColumns"
        striped
        hoverable
        @row:click="onRowClick"
      >
        <template #cell(donor_name)="{ rowData }">
          <div class="cell-donor">
            <span class="avatar-sm">{{ initials(rowData.donor_name) }}</span>
            <span class="donor-name">{{ rowData.donor_name }}</span>
          </div>
        </template>
        <template #cell(status)="{ rowData }">
          <span class="status-tag" :data-status="rowData.status">
            {{ rowData.status }}
          </span>
        </template>
        <template #cell(confirmed)="{ rowData }">
          <span v-if="rowData.confirmed" class="confirmed-yes">✓ Yes</span>
          <span v-else class="confirmed-no">No</span>
        </template>
        <template #cell(actions)="{ rowData }">
          <VaIcon name="chevron_right" size="20px" color="#94a3b8" />
        </template>
      </VaDataTable>
    </div>

    <Transition name="fade">
      <div
        v-if="detailOpen && selected"
        class="modal-overlay"
        @click.self="closeDetail"
      >
        <div class="detail-modal">
          <div class="detail-header">
            <div class="detail-header-left">
              <span class="avatar-lg">{{ initials(selected.donor_name) }}</span>
              <div>
                <h2>{{ selected.donor_name || "Anonymous" }}</h2>
                <span v-if="selected.donor_email" class="detail-email"
                  >&lt;{{ selected.donor_email }}&gt;</span
                >
              </div>
            </div>
            <button type="button" class="close-btn" @click="closeDetail">
              <VaIcon name="close" size="22px" />
            </button>
          </div>

          <div class="detail-amount-row">
            <span class="detail-amount">{{
              formatAmount(selected.amount, selected.currency)
            }}</span>
            <span class="status-tag" :data-status="selected.status">{{
              selected.status
            }}</span>
            <span v-if="selected.confirmed" class="confirmed-yes"
              >✓ Confirmed</span
            >
          </div>

          <div class="detail-grid">
            <div class="detail-cell">
              <span class="meta-label">Type</span>
              <span class="meta-value">{{
                selected.donation_type === "monthly" ? "Monthly" : "One-time"
              }}</span>
            </div>
            <div class="detail-cell">
              <span class="meta-label">Payment Method</span>
              <span class="meta-value">{{
                selected.payment_method_code || "—"
              }}</span>
            </div>
            <div v-if="selected.phone" class="detail-cell">
              <span class="meta-label">Phone</span>
              <span class="meta-value">{{ selected.phone }}</span>
            </div>
            <div v-if="selected.external_reference" class="detail-cell">
              <span class="meta-label">External Ref</span>
              <span class="meta-value">{{ selected.external_reference }}</span>
            </div>
            <div v-if="selected.transaction_reference" class="detail-cell">
              <span class="meta-label">Transaction Ref</span>
              <span class="meta-value">{{
                selected.transaction_reference
              }}</span>
            </div>
            <div v-if="selected.payment_id" class="detail-cell">
              <span class="meta-label">Payment ID</span>
              <span class="meta-value mono">{{ selected.payment_id }}</span>
            </div>
            <div v-if="selected.payment_link_id" class="detail-cell">
              <span class="meta-label">Payment Link ID</span>
              <span class="meta-value mono">{{
                selected.payment_link_id
              }}</span>
            </div>
            <div v-if="selected.initiation_channel" class="detail-cell">
              <span class="meta-label">Initiation Channel</span>
              <span class="meta-value">{{ selected.initiation_channel }}</span>
            </div>
            <div class="detail-cell">
              <span class="meta-label">Created</span>
              <span class="meta-value">{{
                formatFullDate(selected.created_at)
              }}</span>
            </div>
            <div class="detail-cell">
              <span class="meta-label">Updated</span>
              <span class="meta-value">{{
                formatFullDate(selected.updated_at)
              }}</span>
            </div>
          </div>

          <div v-if="loadingConfirmations" class="confirmations-loading">
            <VaProgressCircle indeterminate size="small" />
            Loading confirmations…
          </div>

          <div v-else-if="confirmations.length" class="confirmations-section">
            <h3 class="confirmations-title">
              <VaIcon name="receipt_long" size="18px" />
              Webhook Audit Trail ({{ confirmations.length }})
            </h3>
            <VaDataTable
              class="confirmations-table"
              :items="confirmationRows"
              :columns="confirmationColumns"
              striped
            >
              <template #cell(event_type)="{ rowData }">
                <span class="conf-event">{{ rowData.event_type }}</span>
                <div class="conf-event-id mono">{{ rowData.event_id }}</div>
              </template>
              <template #cell(status)="{ rowData }">
                <span v-if="rowData.duplicate" class="dup-badge"
                  >DUPLICATE</span
                >
                <span v-if="rowData.processed" class="proc-badge"
                  >PROCESSED</span
                >
              </template>
            </VaDataTable>
          </div>

          <div class="detail-actions">
            <button type="button" class="action-btn edit" @click="openEdit">
              <VaIcon name="edit" size="18px" />
              Edit
            </button>
            <button type="button" class="action-btn delete" @click="openDelete">
              <VaIcon name="delete" size="18px" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div
        v-if="editDialogOpen"
        class="modal-overlay"
        @click.self="editDialogOpen = false"
      >
        <div class="modal-card">
          <h3>Edit Donation #{{ selected?.id }}</h3>
          <p v-if="error" class="banner error">{{ error }}</p>
          <div class="form-grid">
            <label class="form-field">
              <span>Status</span>
              <select v-model="editForm.status">
                <option value="pending">Pending</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
              </select>
            </label>
            <label class="form-field">
              <span>Confirmed</span>
              <select v-model="editForm.confirmed">
                <option :value="false">No</option>
                <option :value="true">Yes</option>
              </select>
            </label>
            <label class="form-field">
              <span>Donor Name</span>
              <input
                v-model="editForm.donor_name"
                type="text"
                placeholder="Donor name"
              />
            </label>
            <label class="form-field">
              <span>Donor Email</span>
              <input
                v-model="editForm.donor_email"
                type="email"
                placeholder="donor@example.com"
              />
            </label>
          </div>
          <div class="modal-actions">
            <button
              type="button"
              class="action-btn"
              @click="editDialogOpen = false"
            >
              Cancel
            </button>
            <button
              type="button"
              class="action-btn save"
              :disabled="saving"
              @click="saveEdit"
            >
              {{ saving ? "Saving…" : "Save Changes" }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div
        v-if="deleteConfirmOpen"
        class="modal-overlay"
        @click.self="deleteConfirmOpen = false"
      >
        <div class="modal-card small">
          <h3>Delete Donation #{{ selected?.id }}?</h3>
          <p class="delete-warning">
            This will permanently remove the donation record for
            <strong>{{ selected?.donor_name || "Anonymous" }}</strong>
            ({{
              formatAmount(selected?.amount || "0", selected?.currency || "")
            }}).
          </p>
          <p v-if="error" class="banner error">{{ error }}</p>
          <div class="modal-actions">
            <button
              type="button"
              class="action-btn"
              @click="deleteConfirmOpen = false"
            >
              Cancel
            </button>
            <button
              type="button"
              class="action-btn delete"
              :disabled="saving"
              @click="confirmDelete"
            >
              {{ saving ? "Deleting…" : "Delete" }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.donations-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}
.page-header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #0a1f44;
}
.subtitle {
  margin: 0.15rem 0 0;
  font-size: 0.88rem;
  color: #5b6b82;
}
.refresh-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border: 1px solid #e6ebf2;
  border-radius: 999px;
  padding: 0.55rem 1rem;
  background: #fff;
  color: #0a1f44;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  transition:
    border-color 0.2s,
    color 0.2s;
}
.refresh-btn:hover {
  border-color: #ff6a00;
  color: #ff6a00;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.85rem;
}
.stat-card {
  background: #fff;
  border: 1px solid #e6ebf2;
  border-radius: 14px;
  padding: 1rem 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.stat-card.success {
  border-left: 3px solid #0a7a3d;
}
.stat-card.pending {
  border-left: 3px solid #ff6a00;
}
.stat-card.amount {
  border-left: 3px solid #0a1f44;
}
.stat-value {
  font-size: 1.4rem;
  font-weight: 800;
  color: #0a1f44;
}
.stat-card.success .stat-value {
  color: #0a7a3d;
}
.stat-card.pending .stat-value {
  color: #ff6a00;
}
.stat-label {
  font-size: 0.78rem;
  color: #5b6b82;
  font-weight: 600;
}

.gmail {
  --mail-border: #e6ebf2;
  --mail-muted: #5b6b82;
  --mail-navy: #0a1f44;
  --mail-orange: #ff6a00;
  --mail-green: #0a7a3d;
  --mail-surface: #fff;
  --mail-hover: #f6f8fb;
  --mail-active: #eef3fa;
  --mail-unread: #0a1f44;

  display: grid;
  grid-template-columns: 200px minmax(280px, 380px) 1fr;
  min-height: 500px;
  background: var(--mail-surface);
  border: 1px solid var(--mail-border);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 28px rgba(10, 31, 68, 0.06);
}

.mail-nav {
  background: #f7f9fc;
  border-right: 1px solid var(--mail-border);
  padding: 1rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.mail-nav nav {
  display: grid;
  gap: 0.15rem;
}
.nav-item {
  display: grid;
  grid-template-columns: 24px 1fr auto;
  align-items: center;
  gap: 0.65rem;
  border: 0;
  background: transparent;
  color: var(--mail-navy);
  font: inherit;
  font-size: 0.92rem;
  padding: 0.55rem 0.85rem;
  border-radius: 0 999px 999px 0;
  margin-right: 0.35rem;
  cursor: pointer;
  text-align: left;
}
.nav-item:hover {
  background: rgba(10, 31, 68, 0.06);
}
.nav-item.active {
  background: rgba(255, 106, 0, 0.14);
  color: var(--mail-orange);
  font-weight: 700;
}
.nav-count {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--mail-muted);
}
.nav-item.active .nav-count {
  color: var(--mail-orange);
}

.mail-list-pane {
  border-right: 1px solid var(--mail-border);
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: #fff;
}
.list-toolbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 0.75rem;
  border-bottom: 1px solid var(--mail-border);
}
.search {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f1f4f8;
  border-radius: 10px;
  padding: 0.45rem 0.75rem;
}
.search input {
  border: 0;
  background: transparent;
  width: 100%;
  font: inherit;
  color: var(--mail-navy);
  outline: none;
}
.toolbar-meta {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}
.unread-pill {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--mail-orange);
  background: rgba(255, 106, 0, 0.12);
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
  white-space: nowrap;
}

.banner {
  margin: 0;
  padding: 0.55rem 0.9rem;
  font-size: 0.85rem;
}
.banner.error {
  background: #fef3f2;
  color: #b42318;
}
.banner.ok {
  background: #ecfdf3;
  color: #0a7a3d;
}

.empty-state {
  flex: 1;
  display: grid;
  place-content: center;
  gap: 0.5rem;
  justify-items: center;
  color: var(--mail-muted);
  padding: 2rem;
  text-align: center;
}
.empty-state p {
  margin: 0;
}

.mail-rows {
  overflow-y: auto;
  flex: 1;
}
.mail-row {
  width: 100%;
  display: grid;
  grid-template-columns: 40px 1fr;
  gap: 0.65rem;
  align-items: start;
  border: 0;
  border-bottom: 1px solid var(--mail-border);
  background: #fff;
  padding: 0.75rem 0.85rem;
  cursor: pointer;
  font: inherit;
  text-align: left;
  color: var(--mail-muted);
}
.mail-row:hover {
  background: var(--mail-hover);
  box-shadow: inset 3px 0 0 var(--mail-orange);
}
.mail-row.active {
  background: var(--mail-active);
  box-shadow: inset 3px 0 0 var(--mail-navy);
}
.mail-row.unread {
  background: #fafbfd;
}
.mail-row.unread .sender,
.mail-row.unread .subject {
  color: var(--mail-unread);
  font-weight: 700;
}
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #163566, var(--mail-navy));
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 0.72rem;
  font-weight: 700;
  flex-shrink: 0;
}
.avatar.lg {
  width: 42px;
  height: 42px;
  font-size: 0.85rem;
}
.row-main {
  min-width: 0;
  display: grid;
  gap: 0.12rem;
}
.row-top {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}
.sender {
  color: var(--mail-navy);
  font-weight: 600;
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.when {
  font-size: 0.75rem;
  color: var(--mail-muted);
  flex-shrink: 0;
  font-weight: 600;
}
.mail-row.unread .when {
  color: var(--mail-orange);
}
.subject {
  font-size: 0.86rem;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.snippet {
  font-size: 0.8rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-dot {
  display: inline-flex;
  align-items: center;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.1rem 0.45rem;
  border-radius: 999px;
  text-transform: uppercase;
}
.status-dot[data-status="success"] {
  background: #ecfdf3;
  color: #0a7a3d;
}
.status-dot[data-status="pending"] {
  background: #fff7ed;
  color: #c2410c;
}
.status-dot[data-status="failed"] {
  background: #fef3f2;
  color: #b42318;
}
.confirmed-badge {
  color: #0a7a3d;
  font-weight: 700;
}

.reading-pane {
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: #fff;
}
.empty-reading {
  flex: 1;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 0.65rem;
  color: var(--mail-muted);
}
.empty-reading p {
  margin: 0;
}
.reading-top {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--mail-border);
}
.reading-top h2 {
  margin: 0;
  flex: 1;
  font-size: 1.35rem;
  font-weight: 500;
  color: var(--mail-navy);
}
.back-btn {
  display: none;
  border: 0;
  background: transparent;
  color: var(--mail-navy);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  place-items: center;
  cursor: pointer;
}
.back-btn:hover {
  background: var(--mail-hover);
}
.status-chip {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
  text-transform: uppercase;
}
.status-chip[data-status="success"] {
  background: #ecfdf3;
  color: #0a7a3d;
}
.status-chip[data-status="pending"] {
  background: #fff7ed;
  color: #c2410c;
}
.status-chip[data-status="failed"] {
  background: #fef3f2;
  color: #b42318;
}

.thread {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem;
  display: grid;
  gap: 1.25rem;
  align-content: start;
}
.bubble-head {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.75rem;
  align-items: start;
  margin-bottom: 0.85rem;
}
.who {
  display: grid;
  gap: 0.1rem;
  min-width: 0;
}
.who strong {
  color: var(--mail-navy);
  font-size: 0.95rem;
}
.who span {
  color: var(--mail-muted);
  font-size: 0.8rem;
}
.bubble-head time {
  font-size: 0.78rem;
  color: var(--mail-muted);
  white-space: nowrap;
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.85rem;
  padding-left: calc(42px + 0.75rem);
}
.meta-label {
  display: block;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--mail-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.meta-value {
  display: block;
  font-size: 0.9rem;
  color: var(--mail-navy);
  font-weight: 500;
  word-break: break-word;
}
.mono {
  font-family: "SF Mono", "Monaco", "Cascadia Code", monospace;
  font-size: 0.82rem;
}

.confirmations-loading {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  color: var(--mail-muted);
  font-size: 0.88rem;
  padding-left: calc(42px + 0.75rem);
}
.confirmations-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--mail-navy);
  margin: 0 0 0.5rem;
  padding-left: calc(42px + 0.75rem);
}
.confirmations-table {
  margin-left: calc(42px + 0.75rem);
}
.conf-event {
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--mail-navy);
}
.dup-badge,
.proc-badge {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  text-transform: uppercase;
}
.dup-badge {
  background: #fef3f2;
  color: #b42318;
}
.proc-badge {
  background: #ecfdf3;
  color: #0a7a3d;
}
.conf-head time {
  font-size: 0.75rem;
  color: var(--mail-muted);
  margin-left: auto;
}
.conf-event-id {
  font-size: 0.78rem;
  color: var(--mail-muted);
  margin-top: 0.3rem;
}

.action-bar {
  display: flex;
  gap: 0.5rem;
  padding: 0.85rem 1.25rem;
  border-top: 1px solid var(--mail-border);
}
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid var(--mail-border);
  background: #fff;
  color: var(--mail-navy);
  border-radius: 999px;
  padding: 0.5rem 1rem;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.action-btn:hover {
  border-color: var(--mail-orange);
  color: var(--mail-orange);
}
.action-btn.save {
  background: var(--mail-orange);
  color: #fff;
  border-color: var(--mail-orange);
}
.action-btn.save:hover {
  background: #e04500;
  border-color: #e04500;
}
.action-btn.delete:hover {
  border-color: #b42318;
  color: #b42318;
}
.action-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 31, 68, 0.45);
  display: grid;
  place-items: center;
  z-index: 100;
  padding: 1rem;
}
.modal-card {
  background: #fff;
  border-radius: 16px;
  padding: 1.5rem;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 24px 60px rgba(10, 31, 68, 0.2);
}
.modal-card.small {
  max-width: 400px;
}
.modal-card h3 {
  margin: 0 0 1rem;
  font-size: 1.15rem;
  color: var(--mail-navy);
}
.delete-warning {
  font-size: 0.9rem;
  color: #334155;
  line-height: 1.5;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;
  margin-bottom: 1.25rem;
}
.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.form-field span {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--mail-muted);
}
.form-field input,
.form-field select {
  border: 1px solid var(--mail-border);
  border-radius: 8px;
  padding: 0.55rem 0.75rem;
  font: inherit;
  color: var(--mail-navy);
  outline: none;
}
.form-field input:focus,
.form-field select:focus {
  border-color: var(--mail-orange);
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 1100px) {
  .gmail {
    grid-template-columns: 72px minmax(240px, 320px) 1fr;
  }
  .nav-label,
  .nav-count {
    display: none;
  }
  .nav-item {
    grid-template-columns: 1fr;
    justify-items: center;
    border-radius: 12px;
    margin-right: 0;
    padding: 0.65rem;
  }
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 820px) {
  .gmail {
    grid-template-columns: 1fr;
    min-height: 400px;
  }
  .mail-nav {
    flex-direction: row;
    overflow-x: auto;
    border-right: 0;
    border-bottom: 1px solid var(--mail-border);
    padding: 0.65rem;
  }
  .mail-nav nav {
    display: flex;
    gap: 0.25rem;
  }
  .nav-item {
    grid-template-columns: auto auto;
    border-radius: 999px;
    white-space: nowrap;
    padding: 0.45rem 0.75rem;
  }
  .nav-label {
    font-size: 0.85rem;
    display: inline;
  }
  .nav-count {
    display: none;
  }
  .mail-list-pane {
    border-right: 0;
  }
  .reading-pane {
    display: none;
  }
  .gmail.reading .mail-nav,
  .gmail.reading .mail-list-pane {
    display: none;
  }
  .gmail.reading .reading-pane {
    display: flex;
  }
  .back-btn {
    display: grid;
  }
  .meta-grid {
    padding-left: 0;
    grid-template-columns: 1fr;
  }
  .confirmations-loading,
  .confirmations-title,
  .confirmations-table {
    padding-left: 0;
    margin-left: 0;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
}
.toolbar-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}
.filter-tabs {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}
.filter-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid #e6ebf2;
  background: #fff;
  color: #5b6b82;
  font: inherit;
  font-size: 0.88rem;
  font-weight: 600;
  padding: 0.45rem 0.85rem;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s;
}
.filter-tab:hover {
  border-color: #ff6a00;
  color: #ff6a00;
}
.filter-tab.active {
  background: #0a1f44;
  color: #fff;
  border-color: #0a1f44;
}
.tab-count {
  font-size: 0.72rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.25);
  padding: 0.05rem 0.4rem;
  border-radius: 999px;
}
.filter-tab:not(.active) .tab-count {
  background: #f1f4f8;
  color: #5b6b82;
}
.search-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f1f4f8;
  border-radius: 10px;
  padding: 0.45rem 0.75rem;
  min-width: 240px;
  flex: 1;
  max-width: 360px;
}
.search-box input {
  border: 0;
  background: transparent;
  width: 100%;
  font: inherit;
  color: #0a1f44;
  outline: none;
}
.table-card {
  background: #fff;
  border: 1px solid #e6ebf2;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 28px rgba(10, 31, 68, 0.06);
}
.table-loading,
.table-empty {
  display: grid;
  place-content: center;
  gap: 0.5rem;
  justify-items: center;
  color: #5b6b82;
  padding: 3rem;
  text-align: center;
}
.table-empty p {
  margin: 0;
}
.donations-table {
  --va-data-table-thead-background: #f7f9fc;
  --va-data-table-thead-color: #0a1f44;
  --va-data-table-thead-font-weight: 700;
}
.cell-donor {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}
.avatar-sm {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, #163566, #0a1f44);
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 0.65rem;
  font-weight: 700;
  flex-shrink: 0;
}
.donor-name {
  font-weight: 600;
  color: #0a1f44;
  font-size: 0.9rem;
}
.status-tag {
  display: inline-flex;
  align-items: center;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  text-transform: uppercase;
}
.status-tag[data-status="success"] {
  background: #ecfdf3;
  color: #0a7a3d;
}
.status-tag[data-status="pending"] {
  background: #fff7ed;
  color: #c2410c;
}
.status-tag[data-status="failed"] {
  background: #fef3f2;
  color: #b42318;
}
.confirmed-yes {
  color: #0a7a3d;
  font-weight: 700;
  font-size: 0.85rem;
}
.confirmed-no {
  color: #5b6b82;
  font-size: 0.85rem;
}

.detail-modal {
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 640px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 24px 60px rgba(10, 31, 68, 0.2);
  display: flex;
  flex-direction: column;
}
.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e6ebf2;
}
.detail-header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.avatar-lg {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #163566, #0a1f44);
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 0.85rem;
  font-weight: 700;
  flex-shrink: 0;
}
.detail-header h2 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #0a1f44;
}
.detail-email {
  font-size: 0.82rem;
  color: #5b6b82;
}
.close-btn {
  border: 0;
  background: transparent;
  color: #5b6b82;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: background 0.2s;
}
.close-btn:hover {
  background: #f6f8fb;
}
.detail-amount-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e6ebf2;
  flex-wrap: wrap;
}
.detail-amount {
  font-size: 1.6rem;
  font-weight: 800;
  color: #0a1f44;
}
.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.85rem;
  padding: 1.25rem 1.5rem;
}
.detail-cell {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.confirmations-section {
  padding: 0 1.5rem 1rem;
}
.confirmations-section .confirmations-table {
  margin-left: 0;
  border: 1px solid #e6ebf2;
  border-radius: 10px;
  overflow: hidden;
}
.detail-actions {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e6ebf2;
}

@media (max-width: 820px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
  .toolbar-row {
    flex-direction: column;
    align-items: stretch;
  }
  .search-box {
    max-width: none;
  }
  .detail-grid {
    grid-template-columns: 1fr;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
