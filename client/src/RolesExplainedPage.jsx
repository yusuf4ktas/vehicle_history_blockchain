import React from 'react';
import { Link } from 'react-router-dom';
import './RolesExplainedPage.css'; 

export default function RolesExplainedPage() {
  const roles = [
    {
      name: 'DMV / Registrar',
      description: 'The Department of Motor Vehicles (DMV) or a similar registering authority is responsible for the initial registration of a vehicle. They create the first record on the blockchain, establishing the vehicle\'s identity (VIN) and its first owner. This role ensures the foundational data is accurate and officially recorded.',
      permissions: [
        'Register new vehicles.',
        'Record initial ownership.',
        'Can be involved in verifying official transfers or status changes (e.g., salvage titles).',
      ],
      icon: '🏛️',
    },
    {
      name: 'Current Owner',
      description: 'The legally recognized owner of the vehicle. They have the authority to initiate a transfer of ownership. Their actions, such as requesting service or being involved in an accident, are crucial parts of the vehicle\'s history. Owners benefit from a transparent and verifiable history when selling the vehicle.',
      permissions: [
        'Initiate transfer of ownership to a new owner.',
        'Authorize service shops to add maintenance records.',
        'View the complete history of their vehicle.',
      ],
      icon: '👤',
    },
    {
      name: 'Service Shop / Workshop',
      description: 'Authorized automotive service shops or mechanics record maintenance, repairs, and odometer readings. This provides a verifiable trail of the vehicle\'s upkeep, which is valuable for assessing its condition and value. Honesty and accuracy from service shops are key to the system\'s integrity.',
      permissions: [
        'Add service records (e.g., oil changes, part replacements).',
        'Update odometer readings during service.',
        'Record details of repairs performed.',
      ],
      icon: '🔧',
    },
    {
      name: 'Insurer',
      description: 'Insurance companies record significant events such as accidents, claims, and potentially title changes like salvage or rebuilt status due to extensive damage. This information is critical for understanding a vehicle\'s risk profile and past incidents.',
      permissions: [
        'Report accidents and associated damage assessments.',
        'Record insurance claims.',
        'Update vehicle status (e.g., salvage title after a major accident).',
      ],
      icon: '🛡️',
    },
    {
      name: 'Potential Buyer / Public User',
      description: 'Any individual or entity interested in a vehicle\'s history. Potential buyers can access the publicly available (and anonymized where necessary) history to make informed purchasing decisions. This role primarily consumes information and benefits from the transparency provided by the other roles.',
      permissions: [
        'View vehicle history records (e.g., ownership changes, service, accidents, odometer readings).',
        'Verify the authenticity of the vehicle\'s reported history.',
      ],
      icon: '🧐',
    },
  ];

  return (
    <div className="roles-explained-page">
      <div className="roles-header-card">
        <h1>Understanding Roles in Vehicle History</h1>
        <p className="roles-subtitle">
          Each role plays a vital part in maintaining an accurate and transparent vehicle history on the blockchain.
        </p>
        <Link to="/" className="btn btn-back-home">
          <span role="img" aria-label="home icon">🏠</span> Back to Vehicle Search
        </Link>
      </div>

      <div className="roles-grid">
        {roles.map((role) => (
          <div key={role.name} className="role-card">
            <div className="role-card-header">
              <span className="role-icon" role="img" aria-label={`${role.name} icon`}>{role.icon}</span>
              <h2>{role.name}</h2>
            </div>
            <p className="role-description">{role.description}</p>
            <h3>Key Permissions/Actions:</h3>
            <ul>
              {role.permissions.map((permission) => (
                <li key={permission}>{permission}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
       <footer className="app-footer roles-footer">
        <p>ChainTrack ensures transparency through defined roles and verifiable actions.</p>
      </footer>
    </div>
  );
}