import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, calculateMonthlyEmi } from '../utils/format';
import { ArrowRight, Sparkles } from 'lucide-react';

export function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success && data.data) {
          setProducts(data.data);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-brand-900 via-brand-800 to-brand-950 text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-brand-100 text-xs font-semibold border border-white/15">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>1Fi SDE1 Assignment — Mutual Fund Backed Product EMIs</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Purchase Flagship Smartphones with <br />
            <span className="text-emerald-400">Mutual Fund Backed EMIs</span>
          </h1>

          <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto">
            Zero and low-interest EMIs backed by your mutual fund portfolio. Keep your units invested and let compounding work for you.
          </p>
        </div>
      </section>

      {/* Product Catalog Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-gray-950 tracking-tight">Available Flagship Smartphones</h2>
            <p className="text-sm text-gray-500 mt-1">Select a phone to view its dynamic variants and 0% interest EMI options.</p>
          </div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{products.length} Models Available</span>
        </div>

        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-700"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => {
              const defaultVariant = product.variants[0];
              const lowestEmi = defaultVariant && product.emiPlans.length > 0
                ? product.emiPlans.reduce((min, plan) => {
                    const emi = calculateMonthlyEmi(
                      defaultVariant.mrp,
                      defaultVariant.price,
                      plan.interestRate,
                      plan.tenureMonths
                    );
                    return emi < min ? emi : min;
                  }, Infinity)
                : 0;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
                >
                  <div className="p-6">
                    {/* Badge & Brand */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{product.brand}</span>
                      {product.tag && (
                        <span className="px-2.5 py-0.5 rounded text-[11px] font-extrabold tracking-wider uppercase bg-pink-100 text-pink-700 border border-pink-200">
                          {product.tag}
                        </span>
                      )}
                    </div>

                    {/* Image */}
                    <Link to={`/products/${product.slug}`} className="block my-4">
                      <div className="relative w-full h-56 flex items-center justify-center p-2">
                        <img
                          src={defaultVariant?.imageUrl || '/images/iphone-desert.png'}
                          alt={product.name}
                          className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (target.src.endsWith('.png')) {
                              target.src = target.src.replace(/\.png$/, '.svg');
                            }
                          }}
                        />
                      </div>
                    </Link>

                    {/* Finishes */}
                    <div className="flex items-center justify-center space-x-2 my-3">
                      {product.variants.map((v) => (
                        <div
                          key={v.id}
                          className="w-3.5 h-3.5 rounded-full border border-black/10"
                          style={{ backgroundColor: v.colorHex }}
                          title={v.colorName}
                        />
                      ))}
                      <span className="text-[11px] text-gray-400 pl-1 font-medium">
                        {product.variants.length} finishes
                      </span>
                    </div>

                    {/* Title & Description */}
                    <Link to={`/products/${product.slug}`} className="block">
                      <h3 className="text-lg font-extrabold text-gray-950 group-hover:text-brand-700 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                      {product.description}
                    </p>
                  </div>

                  {/* Pricing Footer */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-gray-400 font-medium">EMI Starts At</div>
                      <div className="text-base font-black text-brand-700">
                        {formatCurrency(lowestEmi === Infinity ? 0 : lowestEmi)}
                        <span className="text-xs font-normal text-gray-500">/mo</span>
                      </div>
                    </div>

                    <Link
                      to={`/products/${product.slug}`}
                      className="inline-flex items-center space-x-1 px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                    >
                      <span>View EMI Plans</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}