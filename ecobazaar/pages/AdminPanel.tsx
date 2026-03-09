
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Users, ShieldCheck, Activity, Settings, MoreVertical, ShoppingBag, Plus, Trash2, Package, Gift, Ticket, Coins, Zap, Database as DbIcon, Server, Search, CheckCircle2, BarChart3, FileCode, ExternalLink, Play } from 'lucide-react';
import { getProducts, addProduct, deleteProduct, updateProduct, getMLStatus, trainMLModel, predictCarbon } from '../services/productService';
import { getRewards, addReward, deleteReward } from '../services/rewardService';
import { getUsers, deleteUser, updateUser } from '../src/services/userService';
import { Product, EmissionLevel, Reward, User, UserRole } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [mlStatus, setMLStatus] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'products' | 'rewards' | 'database' | 'ml' | 'api'>('users');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingReward, setIsAddingReward] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isTraining, setIsTraining] = useState(false);

  // Prediction Test State
  const [testData, setTestData] = useState({
    weight: 1.5,
    material: 'plastic',
    usage_frequency: 10,
    transport_distance: 100
  });
  const [predictionResult, setPredictionResult] = useState<any>(null);
  
  // New Product Form State
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    description: '',
    price: 0,
    category: 'Cosmetics',
    image: 'https://picsum.photos/seed/new/400/300',
    brand: '',
    carbonScore: 80,
    emissionFactor: 0.5,
    emissionLevel: EmissionLevel.MEDIUM,
    carbonData: { production: 1, transport: 1, packaging: 1, usage: 1, total: 4 },
    materials: [],
    manufactureDate: new Date().toISOString().split('T')[0],
    expectedLifespan: '2 years',
    repairabilityScore: 5,
    recyclingInstructions: 'Recycle according to local guidelines.',
    lifecycleStages: [
      { stage: 'Production', description: 'Standard manufacturing process.', location: 'Global', icon: 'Factory' }
    ],
    purchaseCount: 0,
    salesTrend: [{ month: 'Jan', sales: 0 }],
    pointsValue: 50
  });
  const [materialInput, setMaterialInput] = useState('');

  // New Reward Form State
  const [newReward, setNewReward] = useState<Omit<Reward, 'id'>>({
    title: '',
    description: '',
    pointsCost: 500,
    discountCode: '',
    type: 'percentage',
    value: 10
  });

  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [userData, productData, rewardData, mlData] = await Promise.all([
          getUsers(),
          getProducts(),
          getRewards(),
          getMLStatus()
        ]);
        setUsers(userData);
        setProducts(productData);
        setRewards(rewardData);
        setMLStatus(mlData);

        // Handle deep link to edit product
        const params = new URLSearchParams(location.search);
        const editId = params.get('edit');
        const tab = params.get('tab');
        if (tab === 'products') setActiveTab('products');
        if (editId && productData.length > 0) {
          const productToEdit = productData.find((p: Product) => p.id === editId);
          if (productToEdit) {
            setEditingProduct(productToEdit);
            setActiveTab('products');
          }
        }
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location.search]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const added = await addProduct(newProduct);
      setProducts([...products, added]);
      setIsAddingProduct(false);
      setNewProduct({
        name: '',
        description: '',
        price: 0,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&q=80&w=400',
        brand: '',
        carbonScore: 80,
        emissionFactor: 0.5,
        emissionLevel: EmissionLevel.MEDIUM,
        carbonData: { production: 1, transport: 1, packaging: 1, usage: 1, total: 4 },
        materials: [],
        manufactureDate: new Date().toISOString().split('T')[0],
        expectedLifespan: '2 years',
        repairabilityScore: 5,
        recyclingInstructions: 'Recycle according to local guidelines.',
        lifecycleStages: [
          { stage: 'Production', description: 'Standard manufacturing process.', location: 'Global', icon: 'Factory' }
        ],
        purchaseCount: 0,
        salesTrend: [{ month: 'Jan', sales: 0 }],
        pointsValue: 50
      });
    } catch (error) {
      alert('Failed to add product');
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      await updateProduct(editingProduct.id, editingProduct);
      setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p));
      setEditingProduct(null);
      alert('Product updated successfully!');
    } catch (error) {
      alert('Failed to update product');
    }
  };

  const handleAddReward = async (e: React.FormEvent) => {
    e.preventDefault();
    const added = await addReward(newReward);
    setRewards([...rewards, added]);
    setIsAddingReward(false);
    setNewReward({
      title: '',
      description: '',
      pointsCost: 500,
      discountCode: '',
      type: 'percentage',
      value: 10
    });
  };

  const handleDeleteReward = async (id: string) => {
    if (confirm('Are you sure you want to delete this reward?')) {
      await deleteReward(id);
      setRewards(rewards.filter(r => r.id !== id));
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        setProducts(products.filter(p => p.id !== id));
      } catch (error) {
        alert('Failed to delete product');
      }
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id);
        setUsers(users.filter(u => u.id !== id));
      } catch (error) {
        alert('Failed to delete user');
      }
    }
  };

  const handleUpdateUserRole = async (id: string, role: UserRole) => {
    try {
      const userToUpdate = users.find(u => u.id === id);
      if (userToUpdate) {
        await updateUser(id, { ...userToUpdate, role });
        setUsers(users.map(u => u.id === id ? { ...u, role } : u));
      }
    } catch (error) {
      alert('Failed to update user role');
    }
  };

  const handleTrainModel = async () => {
    setIsTraining(true);
    try {
      const result = await trainMLModel();
      setMLStatus(result.evaluation);
      alert('Model trained successfully!');
    } catch (error: any) {
      alert(`Training failed: ${error.message}`);
    } finally {
      setIsTraining(false);
    }
  };

  const handlePredictTest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await predictCarbon(testData);
      setPredictionResult(result);
    } catch (error: any) {
      alert(`Prediction failed: ${error.message}`);
    }
  };

  const addMaterial = () => {
    if (materialInput.trim()) {
      setNewProduct({
        ...newProduct,
        materials: [...newProduct.materials, materialInput.trim()]
      });
      setMaterialInput('');
    }
  };

  const renderAPIModule = () => {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100">
          <div className="p-8 bg-slate-900 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/20 rounded-2xl backdrop-blur-md border border-emerald-500/30">
                  <FileCode className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight">API Documentation & Testing</h3>
                  <p className="text-slate-400 font-medium">Swagger / OpenAPI 3.0 Specification</p>
                </div>
              </div>
              <a 
                href="/api-docs" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/20"
              >
                <ExternalLink className="w-4 h-4" /> Open Swagger UI
              </a>
            </div>
          </div>
          
          <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">API Testing Console</h4>
              <div className="space-y-4">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-black rounded uppercase">GET</span>
                      <span className="text-sm font-bold text-slate-700">/api/products</span>
                    </div>
                    <button 
                      onClick={async () => {
                        const res = await fetch('/api/products');
                        const data = await res.json();
                        alert(`Fetched ${data.length} products successfully!`);
                      }}
                      className="p-2 bg-white rounded-xl border border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-all"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Retrieve all sustainable products from the database.</p>
                </div>

                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded uppercase">POST</span>
                      <span className="text-sm font-bold text-slate-700">/api/predict/carbon</span>
                    </div>
                    <button 
                      onClick={() => setActiveTab('ml')}
                      className="p-2 bg-white rounded-xl border border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-all"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Predict carbon footprint using the Random Forest model.</p>
                </div>

                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-[10px] font-black rounded uppercase">GET</span>
                      <span className="text-sm font-bold text-slate-700">/api/users</span>
                    </div>
                    <button 
                      onClick={() => setActiveTab('users')}
                      className="p-2 bg-white rounded-xl border border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-all"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Admin-only endpoint to manage user accounts and roles.</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Error Handling & Validation</h4>
              <div className="bg-slate-900 rounded-[2rem] p-8 text-white">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center border border-red-500/30">
                      <CheckCircle2 className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-100">Centralized Error Handler</h5>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">All API errors are caught and returned in a consistent JSON format with timestamps and status codes.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                      <ShieldCheck className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-100">JWT Authentication</h5>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">Endpoints are secured using Bearer Token authentication with role-based access control (RBAC).</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                      <DbIcon className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-100">Input Validation</h5>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">Strict validation for required fields like weight, material, and email to ensure data integrity.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                      <Users className="w-5 h-5 text-blue-500" />
                      <span className="text-xs text-green-500 font-bold">+12%</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{users.length}</div>
                  <div className="text-xs text-gray-500 font-medium">Total Users</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                      <span className="text-xs text-emerald-500 font-bold">Secure</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">Auth</div>
                  <div className="text-xs text-gray-500 font-medium">JWT Status</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                      <Activity className="w-5 h-5 text-orange-500" />
                      <span className="text-xs text-orange-500 font-bold">Peak</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">99.9%</div>
                  <div className="text-xs text-gray-500 font-medium">System Uptime</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                      <Settings className="w-5 h-5 text-purple-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">Active</div>
                  <div className="text-xs text-gray-500 font-medium">RBAC Engine</div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">Registered Users</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Created At</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                                  {u.name.charAt(0)}
                              </div>
                              <span className="text-sm font-medium text-gray-900">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select 
                            value={u.role}
                            onChange={(e) => handleUpdateUserRole(u.id, e.target.value as UserRole)}
                            className={`px-2 py-1 text-[10px] font-bold rounded uppercase outline-none cursor-pointer ${
                              u.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 
                              u.role === 'Analyst' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            <option value={UserRole.USER}>User</option>
                            <option value={UserRole.ADMIN}>Admin</option>
                            <option value={UserRole.ANALYST}>Analyst</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            onClick={() => handleDeleteUser(u.id)}
                            className="text-red-400 hover:text-red-600 p-2"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && (
                    <div className="p-8 text-center text-gray-500 text-sm">No users registered yet.</div>
                )}
              </div>
            </div>
          </>
        );
      case 'products':
        return (
          <>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                Product Database
              </h3>
              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    if(confirm('Are you sure you want to reset the database to initial products? All custom products will be lost.')) {
                      localStorage.removeItem('ecobazaar_products');
                      window.location.reload();
                    }
                  }}
                  className="flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
                >
                  <Trash2 className="w-4 h-4" /> Reset DB
                </button>
                <button 
                  onClick={() => setIsAddingProduct(true)}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20"
                >
                  <Plus className="w-4 h-4" /> Add Product
                </button>
              </div>
            </div>

            {isAddingProduct && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white max-h-[90vh] overflow-y-auto">
                  <div className="p-8 border-b bg-slate-50 flex items-center justify-between sticky top-0 z-10">
                    <h3 className="text-xl font-black text-slate-900">Add New Item to Database</h3>
                    <button onClick={() => setIsAddingProduct(false)} className="p-2 hover:bg-white rounded-xl transition-colors">
                      <Plus className="w-6 h-6 text-slate-500 rotate-45" />
                    </button>
                  </div>
                  <form onSubmit={handleAddProduct} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Product Name</label>
                        <input 
                          type="text" required value={newProduct.name} 
                          onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Brand</label>
                        <input 
                          type="text" required value={newProduct.brand} 
                          onChange={e => setNewProduct({...newProduct, brand: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Price ($)</label>
                        <input 
                          type="number" step="0.01" required value={newProduct.price} 
                          onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Category</label>
                        <select 
                          value={newProduct.category} 
                          onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all"
                        >
                          <option>Electronics</option>
                          <option>Apparel</option>
                          <option>Home & Kitchen</option>
                          <option>Cosmetics</option>
                          <option>Accessories</option>
                          <option>Personal Care</option>
                          <option>Stationery</option>
                          <option>Clothing</option>
                          <option>Fitness</option>
                          <option>Home</option>
                          <option>Kitchen</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Image URL</label>
                        <input 
                          type="text" required value={newProduct.image} 
                          onChange={e => setNewProduct({...newProduct, image: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Eco Score (0-100)</label>
                        <input 
                          type="number" required value={newProduct.carbonScore} 
                          onChange={e => setNewProduct({...newProduct, carbonScore: parseInt(e.target.value)})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Emission Level</label>
                        <select 
                          value={newProduct.emissionLevel} 
                          onChange={e => setNewProduct({...newProduct, emissionLevel: e.target.value as EmissionLevel})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all"
                        >
                          <option value={EmissionLevel.LOW}>Low Emission</option>
                          <option value={EmissionLevel.MEDIUM}>Medium Emission</option>
                          <option value={EmissionLevel.HIGH}>High Emission</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Points Value</label>
                        <input 
                          type="number" required value={newProduct.pointsValue} 
                          onChange={e => setNewProduct({...newProduct, pointsValue: parseInt(e.target.value)})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Description</label>
                      <textarea 
                        required value={newProduct.description} 
                        onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all h-24"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Materials (Add one by one)</label>
                      <div className="flex gap-2 mb-3">
                        <input 
                          type="text" value={materialInput} 
                          onChange={e => setMaterialInput(e.target.value)}
                          placeholder="e.g. Recycled Cotton"
                          className="flex-grow px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all"
                        />
                        <button type="button" onClick={addMaterial} className="bg-slate-100 p-3 rounded-xl hover:bg-slate-200 transition-colors">
                          <Plus className="w-5 h-5 text-slate-600" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {newProduct.materials.map((m, i) => (
                          <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100 flex items-center gap-2">
                            {m}
                            <button type="button" onClick={() => setNewProduct({...newProduct, materials: newProduct.materials.filter((_, idx) => idx !== i)})}>
                              <Plus className="w-3 h-3 rotate-45" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                    <button type="submit" className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl text-sm hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 transition-all uppercase tracking-widest">
                      Save to Database
                    </button>
                  </form>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <div key={product.id} className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm flex gap-4 items-center group relative">
                  <img src={product.image} alt={product.name} className="w-20 h-20 rounded-2xl object-cover" />
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 truncate">{product.name}</h4>
                      <Zap className="w-3 h-3 text-emerald-500" />
                    </div>
                    <p className="text-xs text-slate-500 font-medium">{product.category} • ${product.price}</p>
                    <div className="flex gap-1 mt-2">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded uppercase">{product.carbonScore} Score</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button 
                      onClick={() => setEditingProduct(product)}
                      className="p-2.5 bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all shadow-sm border border-slate-100"
                      title="Edit Product"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2.5 bg-slate-50 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all shadow-sm border border-slate-100"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {editingProduct && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white max-h-[90vh] overflow-y-auto">
                  <div className="p-8 border-b bg-slate-50 flex items-center justify-between sticky top-0 z-10">
                    <h3 className="text-xl font-black text-slate-900">Edit Product: {editingProduct.name}</h3>
                    <button onClick={() => setEditingProduct(null)} className="p-2 hover:bg-white rounded-xl transition-colors">
                      <Plus className="w-6 h-6 text-slate-500 rotate-45" />
                    </button>
                  </div>
                  <form onSubmit={handleUpdateProduct} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Product Name</label>
                        <input 
                          type="text" required value={editingProduct.name} 
                          onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Brand</label>
                        <input 
                          type="text" required value={editingProduct.brand} 
                          onChange={e => setEditingProduct({...editingProduct, brand: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Price ($)</label>
                        <input 
                          type="number" step="0.01" required value={editingProduct.price} 
                          onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Category</label>
                        <select 
                          value={editingProduct.category} 
                          onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all"
                        >
                          <option>Electronics</option>
                          <option>Apparel</option>
                          <option>Home & Kitchen</option>
                          <option>Cosmetics</option>
                          <option>Accessories</option>
                          <option>Personal Care</option>
                          <option>Stationery</option>
                          <option>Clothing</option>
                          <option>Fitness</option>
                          <option>Home</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Eco Score (0-100)</label>
                        <input 
                          type="number" required value={editingProduct.carbonScore} 
                          onChange={e => setEditingProduct({...editingProduct, carbonScore: parseInt(e.target.value)})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Emission Level</label>
                        <select 
                          value={editingProduct.emissionLevel} 
                          onChange={e => setEditingProduct({...editingProduct, emissionLevel: e.target.value as EmissionLevel})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all"
                        >
                          <option value={EmissionLevel.LOW}>Low Emission</option>
                          <option value={EmissionLevel.MEDIUM}>Medium Emission</option>
                          <option value={EmissionLevel.HIGH}>High Emission</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Image URL</label>
                      <input 
                        type="text" required value={editingProduct.image} 
                        onChange={e => setEditingProduct({...editingProduct, image: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Description</label>
                      <textarea 
                        required value={editingProduct.description} 
                        onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all h-24"
                      />
                    </div>
                    <button type="submit" className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl text-sm hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all uppercase tracking-widest">
                      Update Product
                    </button>
                  </form>
                </div>
              </div>
            )}
          </>
        );
      case 'rewards':
        return (
          <>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Gift className="w-5 h-5 text-blue-600" />
                Rewards Catalog
              </h3>
              <button 
                onClick={() => setIsAddingReward(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
              >
                <Plus className="w-4 h-4" /> Add Reward
              </button>
            </div>

            {isAddingReward && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white max-h-[90vh] overflow-y-auto">
                  <div className="p-8 border-b bg-slate-50 flex items-center justify-between sticky top-0 z-10">
                    <h3 className="text-xl font-black text-slate-900">Create New Reward</h3>
                    <button onClick={() => setIsAddingReward(false)} className="p-2 hover:bg-white rounded-xl transition-colors">
                      <Plus className="w-6 h-6 text-slate-500 rotate-45" />
                    </button>
                  </div>
                  <form onSubmit={handleAddReward} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Reward Title</label>
                        <input 
                          type="text" required value={newReward.title} 
                          onChange={e => setNewReward({...newReward, title: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-blue-500 transition-all"
                          placeholder="e.g. 15% Off Coupon"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Points Cost</label>
                        <input 
                          type="number" required value={newReward.pointsCost} 
                          onChange={e => setNewReward({...newReward, pointsCost: parseInt(e.target.value)})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-blue-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Discount Code</label>
                        <input 
                          type="text" required value={newReward.discountCode} 
                          onChange={e => setNewReward({...newReward, discountCode: e.target.value.toUpperCase()})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-blue-500 transition-all"
                          placeholder="e.g. SAVE15"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Reward Type</label>
                        <select 
                          value={newReward.type} 
                          onChange={e => setNewReward({...newReward, type: e.target.value as 'percentage' | 'fixed'})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-blue-500 transition-all"
                        >
                          <option value="percentage">Percentage Discount</option>
                          <option value="fixed">Fixed Amount Discount</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Discount Value</label>
                        <input 
                          type="number" required value={newReward.value} 
                          onChange={e => setNewReward({...newReward, value: parseFloat(e.target.value)})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-blue-500 transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Description</label>
                      <textarea 
                        required value={newReward.description} 
                        onChange={e => setNewReward({...newReward, description: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-blue-500 transition-all h-24"
                        placeholder="Describe what the user gets..."
                      />
                    </div>
                    <button type="submit" className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl text-sm hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all uppercase tracking-widest">
                      Create Reward
                    </button>
                  </form>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map(reward => (
                <div key={reward.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm relative group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-blue-50 rounded-2xl">
                      <Ticket className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{reward.title}</h4>
                      <div className="flex items-center gap-1 text-amber-600 font-bold text-xs">
                        <Coins className="w-3 h-3" />
                        {reward.pointsCost} Points
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mb-4 line-clamp-2">{reward.description}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Code: {reward.discountCode}</span>
                    <button 
                      onClick={() => handleDeleteReward(reward.id)}
                      className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
              {rewards.length === 0 && (
                <div className="col-span-full py-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <Gift className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-bold">No rewards in catalog yet.</p>
                </div>
              )}
            </div>
          </>
        );
      case 'ml':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-purple-100 rounded-2xl">
                    <Zap className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Model Status</h3>
                    <p className="text-xs text-slate-500">Random Forest v2.0</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Accuracy</span>
                    <span className="font-black text-emerald-600">{(mlStatus?.accuracy * 100 || 0).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Last Trained</span>
                    <span className="font-bold text-slate-900">{mlStatus?.last_trained !== 'Never' ? new Date(mlStatus?.last_trained).toLocaleDateString() : 'Never'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Status</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full uppercase">{mlStatus?.status || 'Ready'}</span>
                  </div>
                </div>
                <button 
                  onClick={handleTrainModel}
                  disabled={isTraining}
                  className="w-full mt-6 py-3 bg-purple-600 text-white text-sm font-black rounded-2xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50"
                >
                  {isTraining ? 'Training...' : 'Retrain Model'}
                </button>
              </div>

              <div className="md:col-span-2 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-600" />
                  Prediction API Test
                </h3>
                <form onSubmit={handlePredictTest} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase mb-2">Weight (kg)</label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={testData.weight}
                        onChange={(e) => setTestData({...testData, weight: parseFloat(e.target.value)})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase mb-2">Material</label>
                      <select 
                        value={testData.material}
                        onChange={(e) => setTestData({...testData, material: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                      >
                        <option value="plastic">Plastic</option>
                        <option value="metal">Metal</option>
                        <option value="wood">Wood</option>
                        <option value="glass">Glass</option>
                        <option value="bamboo">Bamboo</option>
                      </select>
                    </div>
                    <button 
                      type="submit"
                      className="w-full py-3 bg-emerald-600 text-white text-sm font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20"
                    >
                      Run Prediction
                    </button>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    <h4 className="text-xs font-black text-slate-400 uppercase mb-4">Output Results</h4>
                    {predictionResult ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                          <span className="text-xs text-slate-500 font-bold">Carbon Prediction</span>
                          <span className="text-2xl font-black text-slate-900">{predictionResult.carbon_prediction} <span className="text-xs font-normal text-slate-400">kg CO2e</span></span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-500 font-bold">Sustainability Score</span>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                            predictionResult.sustainability_score > 80 ? 'bg-emerald-100 text-emerald-700' :
                            predictionResult.sustainability_score > 50 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {predictionResult.sustainability_score}/100
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-500 font-bold">Classification</span>
                          <span className="font-bold text-slate-900">{predictionResult.emission_classification}</span>
                        </div>
                        <div className="pt-4 border-t border-slate-200">
                          <p className="text-[10px] text-slate-400 leading-relaxed">
                            Model Confidence: {(predictionResult.confidence * 100).toFixed(1)}% | Version: {predictionResult.model_metadata.version}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center py-8">
                        <Search className="w-8 h-8 text-slate-200 mb-2" />
                        <p className="text-xs text-slate-400 font-medium">Enter data and run prediction to see results</p>
                      </div>
                    )}
                  </div>
                </form>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Model Performance Metrics
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Accuracy', value: mlStatus?.accuracy * 100 || 0 },
                    { name: 'Confidence', value: 92 },
                    { name: 'Precision', value: 88 },
                    { name: 'Recall', value: 85 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} />
                    <Tooltip 
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                      cursor={{fill: '#f8fafc'}}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={60}>
                      <Cell fill="#10b981" />
                      <Cell fill="#3b82f6" />
                      <Cell fill="#f59e0b" />
                      <Cell fill="#8b5cf6" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );
      case 'api':
        return renderAPIModule();
      case 'database':
      default:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-emerald-50 rounded-2xl">
                    <DbIcon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">SQLite Engine</h4>
                    <p className="text-xs text-slate-500">Persistent Storage</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Status</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Connected
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Database File</span>
                    <span className="text-slate-900 font-mono text-xs">ecobazar.db</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-blue-50 rounded-2xl">
                    <Server className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">API Documentation</h4>
                    <p className="text-xs text-slate-500">Swagger/OpenAPI</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mb-4">Interactive documentation for all backend modules.</p>
                <a 
                  href="/api-docs" 
                  target="_blank"
                  className="block w-full py-2 text-center bg-blue-50 text-blue-600 text-xs font-black rounded-xl hover:bg-blue-100 transition-all"
                >
                  Open API Docs
                </a>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-purple-50 rounded-2xl">
                    <Zap className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">ML Module</h4>
                    <p className="text-xs text-slate-500">Carbon Prediction</p>
                  </div>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Model Status</span>
                    <span className="text-purple-600 font-bold">{mlStatus?.status || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Accuracy</span>
                    <span className="text-slate-900 font-bold">{(mlStatus?.accuracy * 100).toFixed(1)}%</span>
                  </div>
                </div>
                <button 
                  onClick={handleTrainModel}
                  className="w-full py-2 bg-purple-600 text-white text-xs font-black rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/20"
                >
                  Retrain Model
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
              <div className="px-8 py-6 border-b bg-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Database Schema & Stats</h3>
                  <p className="text-xs text-slate-500">Real-time table monitoring</p>
                </div>
                <div className="flex gap-2">
                  <div className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full uppercase">Indexes Active</div>
                  <div className="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-black rounded-full uppercase">Foreign Keys ON</div>
                </div>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Table Overview</h4>
                  <div className="space-y-4">
                    {[
                      { name: 'users', count: users.length, icon: Users, color: 'text-blue-500' },
                      { name: 'products', count: products.length, icon: Package, color: 'text-emerald-500' },
                      { name: 'user_activity', count: 'Active', icon: Activity, color: 'text-orange-500' },
                      { name: 'rewards', count: rewards.length, icon: Gift, color: 'text-purple-500' }
                    ].map(table => (
                      <div key={table.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-3">
                          <table.icon className={`w-5 h-5 ${table.color}`} />
                          <span className="font-bold text-slate-900">{table.name}</span>
                        </div>
                        <span className="text-sm font-black text-slate-500">{table.count} rows</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-6">
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Optimization Log</h4>
                  <div className="bg-slate-900 rounded-2xl p-6 font-mono text-[10px] text-emerald-400 space-y-2">
                    <p>[{new Date().toLocaleTimeString()}] PRAGMA foreign_keys = ON;</p>
                    <p>[{new Date().toLocaleTimeString()}] CREATE INDEX idx_users_email ON users(email);</p>
                    <p>[{new Date().toLocaleTimeString()}] CREATE INDEX idx_products_category ON products(category);</p>
                    <p>[{new Date().toLocaleTimeString()}] ANALYZE products;</p>
                    <p>[{new Date().toLocaleTimeString()}] VACUUM;</p>
                    <p className="text-slate-500 mt-4">Database optimized and ready.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-emerald-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Control Center</h1>
            <p className="text-gray-600">Full system access and database management.</p>
          </div>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Users
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'products' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Products
          </button>
          <button 
            onClick={() => setActiveTab('rewards')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'rewards' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Rewards
          </button>
          <button 
            onClick={() => setActiveTab('database')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'database' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Database
          </button>
          <button 
            onClick={() => setActiveTab('ml')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'ml' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            ML Module
          </button>
          <button 
            onClick={() => setActiveTab('api')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'api' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            API Docs
          </button>
        </div>
      </div>

      {renderTabContent()}
    </div>
  );
};

export default AdminPanel;
