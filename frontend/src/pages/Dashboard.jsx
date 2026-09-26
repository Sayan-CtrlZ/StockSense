import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Clock,
  AlertCircle,
  Package,
  Boxes,
  Warehouse,
  CheckCircle2,
  RefreshCw,
  SlidersHorizontal,
  ArrowLeftRight,
  ShieldCheck,
  ClipboardList,
  Truck,
  ArrowRight,
} from 'lucide-react';
import { api, apiError, unwrap } from '../services/api';

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Determine user role
  const isStaff = user?.role === 'warehouse_staff';

  const loadMetrics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/dashboard/kpis');
      setData(unwrap(res));
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const receiptCard = data?.cards?.receipt || {
    toReceive: 4,
    late: 1,
    operations: 6,
  };

  const deliveryCard = data?.cards?.delivery || {
    toDeliver: 4,
    late: 1,
    waiting: 2,
    operations: 6,
  };

  const opsSummary = data?.operationsSummary || {
    pendingReceipts: 4,
    pendingDeliveries: 4,
    pendingTransfers: 2,
    pendingAdjustments: 1,
  };

  return (
    <div className="dashboard-page" id="dashboard-page-container">
      {/* ----------------- 1. HEADER SECTION (Role-Aware) ----------------- */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="page-title">
              {isStaff ? 'Warehouse Floor Operations' : 'Dashboard'}
            </h1>
            <span
              className={`status-pill ${isStaff ? 'status-ready' : 'status-done'}`}
              style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
              {isStaff ? 'Warehouse Staff View' : 'Manager Overview'}
            </span>
          </div>
          <p className="page-subtitle">
            {isStaff
              ? 'Floor Execution — Picking, Packing, Inbound Shelving, Transfers & Physical Stock Counting.'
              : 'Real-time statistics, operational cards & warehouse overview.'}
          </p>
        </div>

        <button className="btn btn-secondary" onClick={loadMetrics} disabled={loading} id="dashboard-refresh-btn">
          <RefreshCw size={15} className={loading ? 'spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {error && <div className="alert-banner alert-danger">{error}</div>}

      {/* ----------------- 2. INVENTORY MANAGER DASHBOARD ----------------- */}
      {!isStaff ? (
        <>
          {/* Main Wireframe Operational Cards Grid */}
          <div className="wireframe-cards-container">
            {/* Card 1: Receipt */}
            <div className="wf-card wf-card-receipt" id="card-receipt">
              <div className="wf-card-header">
                <div className="wf-card-title-group">
                  <div className="wf-icon-badge text-emerald">
                    <ArrowDownToLine size={20} />
                  </div>
                  <h2 className="wf-card-title">Receipt</h2>
                </div>
                <span className="wf-card-tag">Inbound</span>
              </div>

              <div className="wf-card-body">
                {/* Primary Action Button */}
                <div className="wf-main-button-wrap">
                  <button
                    id="btn-to-receive"
                    className="wf-main-button"
                    onClick={() => navigate('/operations/receipts?filter=to-receive')}
                    title="View receipts waiting to be received"
                  >
                    <span className="wf-count-huge">{receiptCard.toReceive}</span>
                    <span className="wf-label-sub">to receive</span>
                  </button>
                </div>

                {/* Sub-counters on the right matching Wireframe */}
                <div className="wf-sub-counters">
                  <button
                    id="btn-receipt-late"
                    className="wf-sub-row text-rose-hover"
                    onClick={() => navigate('/operations/receipts?filter=late')}
                    title="View late inbound receipts"
                  >
                    <span className="wf-sub-count text-rose">{receiptCard.late}</span>
                    <span className="wf-sub-label">Late</span>
                  </button>

                  <button
                    id="btn-receipt-operations"
                    className="wf-sub-row text-slate-hover"
                    onClick={() => navigate('/operations/receipts?filter=operations')}
                    title="View scheduled operations"
                  >
                    <span className="wf-sub-count">{receiptCard.operations}</span>
                    <span className="wf-sub-label">operations</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Card 2: Delivery */}
            <div className="wf-card wf-card-delivery" id="card-delivery">
              <div className="wf-card-header">
                <div className="wf-card-title-group">
                  <div className="wf-icon-badge text-rose">
                    <ArrowUpFromLine size={20} />
                  </div>
                  <h2 className="wf-card-title">Delivery</h2>
                </div>
                <span className="wf-card-tag">Outbound</span>
              </div>

              <div className="wf-card-body">
                {/* Primary Action Button */}
                <div className="wf-main-button-wrap">
                  <button
                    id="btn-to-deliver"
                    className="wf-main-button"
                    onClick={() => navigate('/operations/deliveries?filter=to-deliver')}
                    title="View orders waiting to be delivered"
                  >
                    <span className="wf-count-huge">{deliveryCard.toDeliver}</span>
                    <span className="wf-label-sub">to Deliver</span>
                  </button>
                </div>

                {/* Sub-counters on the right matching Wireframe */}
                <div className="wf-sub-counters">
                  <button
                    id="btn-delivery-late"
                    className="wf-sub-row text-rose-hover"
                    onClick={() => navigate('/operations/deliveries?filter=late')}
                    title="View late delivery orders"
                  >
                    <span className="wf-sub-count text-rose">{deliveryCard.late}</span>
                    <span className="wf-sub-label">Late</span>
                  </button>

                  <button
                    id="btn-delivery-waiting"
                    className="wf-sub-row text-amber-hover"
                    onClick={() => navigate('/operations/deliveries?filter=waiting')}
                    title="Orders waiting for stock replenishment"
                  >
                    <span className="wf-sub-count text-amber">{deliveryCard.waiting}</span>
                    <span className="wf-sub-label">waiting</span>
                  </button>

                  <button
                    id="btn-delivery-operations"
                    className="wf-sub-row text-slate-hover"
                    onClick={() => navigate('/operations/deliveries?filter=operations')}
                    title="View scheduled delivery operations"
                  >
                    <span className="wf-sub-count">{deliveryCard.operations}</span>
                    <span className="wf-sub-label">operations</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Wireframe Rule Explanations Card */}
          <div className="wf-rules-card" id="card-wireframe-rules">
            <div className="wf-rules-header">
              <Clock size={18} className="text-indigo" />
              <span>Operational Business Rules:</span>
            </div>
            <ul className="wf-rules-list">
              <li>
                <code>Late:</code> schedule date &lt; today's date
              </li>
              <li>
                <code>Operations:</code> schedule date &gt; today's date
              </li>
              <li>
                <code>Waiting:</code> Waiting for the stocks
              </li>
            </ul>
          </div>

          {/* Global Master Data Overview */}
          <div className="stats-row">
            <div className="stat-card" onClick={() => navigate('/stock')} id="kpi-total-skus">
              <div className="stat-icon-wrap">
                <Package size={22} className="text-indigo" />
              </div>
              <div className="stat-meta">
                <span className="stat-label">Total SKUs</span>
                <span className="stat-value">{data?.totalProductsCount ?? 7}</span>
              </div>
            </div>

            <div className="stat-card" onClick={() => navigate('/stock')} id="kpi-units-stock">
              <div className="stat-icon-wrap">
                <Boxes size={22} className="text-emerald" />
              </div>
              <div className="stat-meta">
                <span className="stat-label">Units in Stock</span>
                <span className="stat-value">{data?.totalItemsInStock ?? 721}</span>
              </div>
            </div>

            <div className="stat-card" onClick={() => navigate('/stock')} id="kpi-low-stock">
              <div className="stat-icon-wrap">
                <AlertCircle size={22} className="text-amber" />
              </div>
              <div className="stat-meta">
                <span className="stat-label">Low Stock Alerts</span>
                <span className="stat-value text-amber">{data?.lowStockCount ?? 2}</span>
              </div>
            </div>

            <div className="stat-card" onClick={() => navigate('/settings/warehouses')} id="kpi-warehouses">
              <div className="stat-icon-wrap">
                <Warehouse size={22} className="text-purple" />
              </div>
              <div className="stat-meta">
                <span className="stat-label">Active Warehouses</span>
                <span className="stat-value">{data?.warehousesCount ?? 4}</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* ----------------- 3. WAREHOUSE STAFF DASHBOARD (Floor Execution) ----------------- */
        <div className="staff-dashboard" id="staff-dashboard-container">
          <div className="wireframe-cards-container">
            {/* Staff Card 1: Inbound Shelving */}
            <div className="wf-card wf-card-receipt" id="staff-card-receipt">
              <div className="wf-card-header">
                <div className="wf-card-title-group">
                  <div className="wf-icon-badge text-emerald">
                    <ArrowDownToLine size={20} />
                  </div>
                  <div>
                    <h2 className="wf-card-title">1. Inbound Shelving</h2>
                    <small className="text-muted">Vendor arrivals waiting for check-in</small>
                  </div>
                </div>
                <span className="wf-card-tag">Floor Task</span>
              </div>

              <div className="wf-card-body">
                <div className="wf-main-button-wrap">
                  <button
                    id="staff-btn-to-receive"
                    className="wf-main-button"
                    onClick={() => navigate('/operations/receipts?filter=to-receive')}
                  >
                    <span className="wf-count-huge">{receiptCard.toReceive}</span>
                    <span className="wf-label-sub">to Shelve & Receive</span>
                  </button>
                </div>

                <div className="wf-sub-counters">
                  <div className="wf-sub-row">
                    <span className="wf-sub-label">Late Arrivals</span>
                    <span className="wf-sub-count text-rose">{receiptCard.late}</span>
                  </div>
                  <div className="wf-sub-row">
                    <span className="wf-sub-label">Total Receipts</span>
                    <span className="wf-sub-count">{receiptCard.operations}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Staff Card 2: Picking & Packing */}
            <div className="wf-card wf-card-delivery" id="staff-card-delivery">
              <div className="wf-card-header">
                <div className="wf-card-title-group">
                  <div className="wf-icon-badge text-rose">
                    <Truck size={20} />
                  </div>
                  <div>
                    <h2 className="wf-card-title">2. Picking & Packing</h2>
                    <small className="text-muted">Customer orders ready for dispatch</small>
                  </div>
                </div>
                <span className="wf-card-tag">Floor Task</span>
              </div>

              <div className="wf-card-body">
                <div className="wf-main-button-wrap">
                  <button
                    id="staff-btn-to-deliver"
                    className="wf-main-button"
                    onClick={() => navigate('/operations/deliveries?filter=to-deliver')}
                  >
                    <span className="wf-count-huge">{deliveryCard.toDeliver}</span>
                    <span className="wf-label-sub">to Pick & Pack</span>
                  </button>
                </div>

                <div className="wf-sub-counters">
                  <div className="wf-sub-row">
                    <span className="wf-sub-label">Urgent / Late</span>
                    <span className="wf-sub-count text-rose">{deliveryCard.late}</span>
                  </div>
                  <div className="wf-sub-row">
                    <span className="wf-sub-label">Waiting Stock</span>
                    <span className="wf-sub-count text-amber">{deliveryCard.waiting}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Staff Lower Cards: Transfers & Physical Counting */}
          <div className="wireframe-cards-container" style={{ marginTop: '0px' }}>
            {/* Staff Card 3: Internal Transfers */}
            <div className="wf-card" style={{ borderColor: '#c7d2fe' }} id="staff-card-transfers">
              <div className="wf-card-header">
                <div className="wf-card-title-group">
                  <div className="wf-icon-badge text-indigo" style={{ background: '#eef2ff' }}>
                    <ArrowLeftRight size={20} />
                  </div>
                  <div>
                    <h2 className="wf-card-title">3. Internal Transfers</h2>
                    <small className="text-muted">Inter-rack & warehouse bin relocations</small>
                  </div>
                </div>
                <span className="status-pill status-ready">Scheduled</span>
              </div>

              <div className="wf-card-body">
                <div className="wf-main-button-wrap">
                  <button
                    id="staff-btn-to-transfer"
                    className="wf-main-button"
                    style={{ background: '#eef2ff', borderColor: '#a5b4fc', color: '#3730a3' }}
                    onClick={() => navigate('/operations/transfers')}
                  >
                    <span className="wf-count-huge">{opsSummary.pendingTransfers}</span>
                    <span className="wf-label-sub">Transfers to Move</span>
                  </button>
                </div>

                <div className="wf-sub-counters">
                  <div className="wf-sub-row">
                    <span className="wf-sub-label">Movement Type</span>
                    <span className="font-semibold" style={{ fontSize: '13px', color: '#4f46e5' }}>Rack to Rack</span>
                  </div>
                  <div className="wf-sub-row">
                    <span className="wf-sub-label">Ledger Audit</span>
                    <span className="font-semibold text-emerald" style={{ fontSize: '13px' }}>Automatic</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Staff Card 4: Physical Counting */}
            <div className="wf-card" style={{ borderColor: '#fde68a' }} id="staff-card-adjustments">
              <div className="wf-card-header">
                <div className="wf-card-title-group">
                  <div className="wf-icon-badge text-amber" style={{ background: '#fffbeb' }}>
                    <SlidersHorizontal size={20} />
                  </div>
                  <div>
                    <h2 className="wf-card-title">4. Stock Counting</h2>
                    <small className="text-muted">Reconcile physical inventory counts</small>
                  </div>
                </div>
                <span className="status-pill status-waiting">Audit</span>
              </div>

              <div className="wf-card-body">
                <div className="wf-main-button-wrap">
                  <button
                    id="staff-btn-to-adjust"
                    className="wf-main-button"
                    style={{ background: '#fffbeb', borderColor: '#fcd34d', color: '#92400e' }}
                    onClick={() => navigate('/operations/adjustments')}
                  >
                    <span className="wf-count-huge">{opsSummary.pendingAdjustments}</span>
                    <span className="wf-label-sub">Counts to Reconcile</span>
                  </button>
                </div>

                <div className="wf-sub-counters">
                  <div className="wf-sub-row">
                    <span className="wf-sub-label">Method</span>
                    <span className="font-semibold" style={{ fontSize: '13px' }}>Physical Count</span>
                  </div>
                  <div className="wf-sub-row">
                    <span className="wf-sub-label">Audit Log</span>
                    <span className="font-semibold text-emerald" style={{ fontSize: '13px' }}>Real-time</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
