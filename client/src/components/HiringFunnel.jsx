import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const HiringFunnel = ({ data }) => {
    return (
        <div className="card h-100 flex flex-col p-6 w-full">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Hiring Funnel
            </h3>

            {data && data.length > 0 && data[0].count > 0 ? (
                <div className="flex-grow w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 20, right: 30, left: -10, bottom: 5 }}>
                            <defs>
                                <linearGradient id="colorFunnel" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--info)" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="var(--info)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-primary)" />
                            <XAxis
                                dataKey="stage"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 500 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                            />
                            <Tooltip
                                cursor={{ stroke: 'var(--border-primary)', strokeWidth: 1, strokeDasharray: '4 4' }}
                                contentStyle={{
                                    backgroundColor: 'var(--bg-secondary)',
                                    border: '1px solid var(--border-primary)',
                                    borderRadius: '8px',
                                    padding: '8px 12px',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                }}
                                itemStyle={{ color: 'var(--info)', fontWeight: 600 }}
                                formatter={(value) => [value, 'Candidates']}
                            />
                            <Area
                                type="monotone"
                                dataKey="count"
                                stroke="var(--info)"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorFunnel)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="flex-grow flex items-center justify-center h-[300px]">
                    <p style={{ color: 'var(--text-tertiary)' }}>No candidates in the hiring pipeline yet.</p>
                </div>
            )}
        </div>
    );
};

export default HiringFunnel;
