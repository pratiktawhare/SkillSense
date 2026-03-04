import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const MatchDistribution = ({ data }) => {
    return (
        <div className="card h-100 flex flex-col p-6 w-full">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Match Score Distribution
            </h3>

            {data && data.length > 0 ? (
                <div className="flex-grow w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-primary)" />
                            <XAxis
                                dataKey="range"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                                dx={-10}
                            />
                            <Tooltip
                                cursor={{ fill: 'var(--bg-tertiary)', opacity: 0.4 }}
                                contentStyle={{
                                    backgroundColor: 'var(--bg-secondary)',
                                    border: '1px solid var(--border-primary)',
                                    borderRadius: '8px',
                                    padding: '8px 12px',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                }}
                                itemStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
                            />
                            <Bar
                                dataKey="count"
                                fill="var(--accent-primary)"
                                radius={[4, 4, 0, 0]}
                                barSize={40}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="flex-grow flex items-center justify-center h-[300px]">
                    <p style={{ color: 'var(--text-tertiary)' }}>No matching data available yet.</p>
                </div>
            )}
        </div>
    );
};

export default MatchDistribution;
