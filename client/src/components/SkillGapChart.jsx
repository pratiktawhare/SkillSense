import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const SkillGapChart = ({ data }) => {
    return (
        <div className="card h-100 flex flex-col p-6 w-full">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Top Skill Gaps
            </h3>

            {data && data.length > 0 ? (
                <div className="flex-grow w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-primary)" />
                            <XAxis
                                type="number"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                            />
                            <YAxis
                                dataKey="skill"
                                type="category"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--text-primary)', fontSize: 13, fontWeight: 500 }}
                                dx={-5}
                                width={100}
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
                                formatter={(value) => [value, 'Missing Candidates']}
                                itemStyle={{ color: 'var(--warning)', fontWeight: 600 }}
                            />
                            <Bar
                                dataKey="missingCount"
                                fill="var(--warning)"
                                radius={[0, 4, 4, 0]}
                                barSize={25}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="flex-grow flex items-center justify-center h-[300px]">
                    <p style={{ color: 'var(--text-tertiary)' }}>Not enough data for skill gap analysis.</p>
                </div>
            )}
        </div>
    );
};

export default SkillGapChart;
