import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ShieldCheck, AlertCircle, X } from 'lucide-react';
import { formatCurrency, calculateMonthlyEmi } from '../utils/format';

export function ProductPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/products/${slug || 'iphone-17-pro'}`);
        const data = await res.json();
        if (data.success && data.data) {
          setProduct(data.data);
          if (data.data.variants.length > 0) {
            setSelectedVariantId(data.data.variants[0].id);
          }
          if (data.data.emiPlans.length > 0) {
            setSelectedPlanId(data.data.emiPlans[0].id);
          }
        } else {
          setError(data.error || 'Failed to load product');
        }
      } catch (err) {
        setError(err.message || 'Network error fetching product');
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [slug]);

  const activeVariant = useMemo(() => {
    if (!product) return undefined;
    return product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];
  }, [product, selectedVariantId]);

  const activePlan = useMemo(() => {
    if (!product) return undefined;
    return product.emiPlans.find((p) => p.id === selectedPlanId) || product.emiPlans[0];
  }, [product, selectedPlanId]);

  const uniqueFinishes = useMemo(() => {
    if (!product) return [];
    const map = new Map();
    product.variants.forEach((v) => {
      if (!map.has(v.colorName)) {
        map.set(v.colorName, {
          colorName: v.colorName,
          colorHex: v.colorHex,
          variantId: v.id,
        });
      }
    });
    return Array.from(map.values());
  }, [product]);

  const uniqueStorages = useMemo(() => {
    if (!product) return [];
    const set = new Set();
    product.variants.forEach((v) => set.add(v.storage));
    return Array.from(set);
  }, [product]);

  const handleProceed = async () => {
    if (!product || !activeVariant || !activePlan) return;
    try {
      setIsSubmitting(true);
      const monthlyEmi = calculateMonthlyEmi(
        activeVariant.mrp,
        activeVariant.price,
        activePlan.interestRate,
        activePlan.tenureMonths
      );

      const res = await fetch('/api/proceed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          variantId: activeVariant.id,
          tenureMonths: activePlan.tenureMonths,
          monthlyEmi,
          interestRate: activePlan.interestRate,
          cashbackAmount: activePlan.cashbackAmount,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setConfirmationData({
          tenureMonths: activePlan.tenureMonths,
          monthlyEmi,
          interestRate: activePlan.interestRate,
          cashbackAmount: activePlan.cashbackAmount,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-700"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Product Not Found</h2>
        <p className="text-gray-500 mb-6">{error || 'Could not find the requested smartphone.'}</p>
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 bg-brand-700 text-white rounded-lg font-bold text-sm"
        >
          Back to all smartphones
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/60 pb-20">
      {/* Breadcrumb / Back Link */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <Link
          to="/"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-brand-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to all smartphones
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-2">
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden p-6 sm:p-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
            
            {/* LEFT COLUMN: Product Visual & Finish Selector */}
            <div className="lg:col-span-5 flex flex-col items-center">
              
              {/* Device Frame */}
              <div className="relative w-full max-w-[280px] h-[440px] flex items-center justify-center p-2">
                <img
                  src={activeVariant?.imageUrl || '/images/iphone-desert.png'}
                  alt={`${product.name} ${activeVariant?.colorName}`}
                  className="w-full h-full object-contain filter drop-shadow-xl transition-all duration-300"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src.endsWith('.png')) {
                      target.src = target.src.replace(/\.png$/, '.svg');
                    }
                  }}
                />
              </div>

              {/* Available in Finishes (Exact layout from reference image) */}
              <div className="w-full text-center mt-3 pt-4 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-2.5">
                  Available in {uniqueFinishes.length} finishes
                </p>
                <div className="flex items-center justify-center space-x-3">
                  {uniqueFinishes.map((finish) => {
                    const isSelected = activeVariant?.colorName === finish.colorName;
                    return (
                      <button
                        key={finish.colorName}
                        onClick={() => {
                          const match =
                            product.variants.find(
                              (v) =>
                                v.colorName === finish.colorName &&
                                v.storage === activeVariant?.storage
                            ) ||
                            product.variants.find((v) => v.colorName === finish.colorName);
                          if (match) setSelectedVariantId(match.id);
                        }}
                        title={finish.colorName}
                        className={`w-6 h-6 rounded-full transition-transform focus:outline-none relative ring-offset-2 ${
                          isSelected
                            ? 'ring-2 ring-brand-700 scale-110 shadow-sm'
                            : 'hover:scale-105 opacity-80 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: finish.colorHex }}
                        aria-label={`Select ${finish.colorName}`}
                      />
                    );
                  })}
                </div>
                <div className="text-xs font-semibold text-gray-700 mt-2">
                  {activeVariant?.colorName}
                </div>
              </div>

              {/* Storage Capacity Selector (if multiple) */}
              {uniqueStorages.length > 1 && (
                <div className="w-full mt-4 pt-3 border-t border-gray-100">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center mb-2">
                    Storage Option
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    {uniqueStorages.map((storage) => {
                      const isStorageSelected = activeVariant?.storage === storage;
                      return (
                        <button
                          key={storage}
                          onClick={() => {
                            const match =
                              product.variants.find(
                                (v) =>
                                  v.storage === storage &&
                                  v.colorName === activeVariant?.colorName
                              ) ||
                              product.variants.find((v) => v.storage === storage);
                            if (match) setSelectedVariantId(match.id);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            isStorageSelected
                              ? 'bg-gray-950 text-white shadow-sm'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {storage}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Matching Reference Image Pixel-for-Pixel */}
            <div className="lg:col-span-7 flex flex-col justify-start">
              
              {/* Top Header: Badge, Product Name, Storage */}
              <div>
                {product.tag && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-extrabold tracking-wider uppercase bg-pink-100 text-pink-700 border border-pink-200">
                    {product.tag}
                  </span>
                )}
                <h1 className="text-3xl font-extrabold text-gray-950 tracking-tight mt-1.5">
                  {product.name}
                </h1>
                <div className="text-sm font-semibold text-gray-500 mt-0.5">
                  {activeVariant?.storage}
                </div>
              </div>

              {/* Price & MRP Strikethrough (Exact Reference Placement) */}
              <div className="mt-4 pb-4 border-b border-gray-100">
                <div className="text-3xl font-black text-gray-950 tracking-tight">
                  {formatCurrency(activeVariant?.price || 0)}
                </div>
                <div className="text-sm font-semibold text-gray-400 line-through mt-0.5">
                  {formatCurrency(activeVariant?.mrp || 0)}
                </div>
              </div>

              {/* EMI Section Heading */}
              <div className="mt-5 mb-3">
                <h2 className="text-base font-bold text-gray-800">
                  EMI plans backed by mutual funds
                </h2>
              </div>

              {/* List of Selectable EMI Plan Cards (Exact Reference Table/Card Layout) */}
              <div className="space-y-2.5">
                {product.emiPlans.map((plan) => {
                  const isSelected = selectedPlanId === plan.id;
                  const monthlyEmi = activeVariant
                    ? calculateMonthlyEmi(
                        activeVariant.mrp,
                        activeVariant.price,
                        plan.interestRate,
                        plan.tenureMonths
                      )
                    : 0;

                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`relative cursor-pointer rounded-xl p-3.5 transition-all flex items-center justify-between border ${
                        isSelected
                          ? 'border-brand-700 bg-brand-50/40 ring-1 ring-brand-700 shadow-xs'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex flex-col">
                        <div className="text-sm font-bold text-gray-900">
                          {formatCurrency(monthlyEmi)} x {plan.tenureMonths} months
                        </div>
                        {plan.cashbackAmount > 0 && (
                          <div className="text-xs font-semibold text-emerald-600 mt-0.5">
                            Additional cashback of {formatCurrency(plan.cashbackAmount)}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-3">
                        <span
                          className={`text-xs font-semibold ${
                            plan.interestRate === 0
                              ? 'text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200'
                              : 'text-gray-600'
                          }`}
                        >
                          {plan.interestRate === 0 ? '0% interest' : `${plan.interestRate}% interest`}
                        </span>

                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'border-brand-700 bg-brand-700'
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Proceed with Selected Plan Button (Exact Reference Action) */}
              <div className="mt-6">
                <button
                  onClick={handleProceed}
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-brand-700 hover:bg-brand-800 active:bg-brand-900 text-white font-bold text-sm shadow-sm hover:shadow transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : 'Proceed with selected plan'}
                </button>
              </div>

              {/* Informational Mutual Fund Callout */}
              <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-gray-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Your mutual fund units remain invested earning compounding returns</span>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* Confirmation Modal when user clicks Proceed */}
      {confirmationData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setConfirmationData(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-950">Plan Selected!</h3>
                <p className="text-xs text-gray-500">Your EMI booking request has been recorded.</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2 border border-gray-100 text-xs text-gray-600 mb-6">
              <div className="flex justify-between">
                <span>Product:</span>
                <span className="font-bold text-gray-900">{product.name} ({activeVariant?.storage})</span>
              </div>
              <div className="flex justify-between">
                <span>Color:</span>
                <span className="font-bold text-gray-900">{activeVariant?.colorName}</span>
              </div>
              <div className="flex justify-between">
                <span>Tenure:</span>
                <span className="font-bold text-gray-900">{confirmationData.tenureMonths} Months</span>
              </div>
              <div className="flex justify-between">
                <span>Monthly EMI:</span>
                <span className="font-bold text-brand-700">{formatCurrency(confirmationData.monthlyEmi)}/mo</span>
              </div>
              <div className="flex justify-between">
                <span>Interest Rate:</span>
                <span className="font-bold text-gray-900">{confirmationData.interestRate}%</span>
              </div>
              <div className="flex justify-between">
                <span>Cashback:</span>
                <span className="font-bold text-emerald-600">{formatCurrency(confirmationData.cashbackAmount)}</span>
              </div>
            </div>

            <button
              onClick={() => setConfirmationData(null)}
              className="w-full py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl"
            >
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
}