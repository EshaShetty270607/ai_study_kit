export interface SampleMaterial {
  id: string;
  title: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  content: string;
}

export const SAMPLE_MATERIALS: SampleMaterial[] = [
  {
    id: 'bio-cellular-respiration',
    title: 'Cellular Respiration & Energy Production',
    subject: 'Biology',
    difficulty: 'medium',
    description: 'ATP generation, Glycolysis, Krebs cycle, and Electron Transport Chain',
    content: `Chapter 8: Cellular Respiration and Metabolic Pathways

Cellular respiration is the primary biochemical pathway by which living cells break down glucose molecules to release energy in the form of Adenosine Triphosphate (ATP). The overall chemical equation is: C6H12O6 + 6O2 -> 6CO2 + 6H2O + ~30-32 ATP.

1. Glycolysis:
Occurs entirely in the cytoplasm (cytosol) under both aerobic and anaerobic conditions. A single 6-carbon glucose molecule is enzymatically split through an energy investment phase (consuming 2 ATP) and an energy payoff phase (producing 4 ATP and 2 NADH), resulting in a net yield of 2 ATP, 2 NADH, and 2 pyruvate molecules.

2. Pyruvate Oxidation and the Citric Acid (Krebs) Cycle:
In the presence of oxygen, pyruvate is actively transported across the mitochondrial membrane into the mitochondrial matrix. Pyruvate is converted into Acetyl-CoA, releasing CO2 and producing NADH. Acetyl-CoA enters the Citric Acid Cycle, joining with oxaloacetate to form citrate. For each turn of the cycle (2 turns per initial glucose), carbons are released as CO2, generating 1 ATP (or GTP), 3 NADH, and 1 FADH2.

3. Oxidative Phosphorylation and Chemiosmosis:
This occurs along the inner mitochondrial cristae membrane. High-energy electrons donated by NADH and FADH2 pass through four transmembrane multi-protein complexes (Complex I-IV). As electrons move down the redox potential gradient, protons (H+) are pumped from the matrix into the intermembrane space, establishing an electrochemical proton-motive force. Protons diffuse back into the matrix through ATP Synthase, powering the rotational catalysis that phosphorylates ADP into ATP. Oxygen serves as the final electron acceptor, combining with free protons to form metabolic water. If oxygen is absent, the electron transport chain backs up, and cells must rely on anaerobic fermentation to regenerate NAD+ from NADH.`,
  },
  {
    id: 'cs-database-acid',
    title: 'Database Transactions & ACID Properties',
    subject: 'Computer Science',
    difficulty: 'hard',
    description: 'Atomicity, Consistency, Isolation levels, and Durability in RDBMS',
    content: `CS 440: Database Systems - Transaction Processing and ACID Guarantees

A database transaction is a logical unit of work comprising one or more database operations (reads and writes) that must be executed reliably. In enterprise database management systems (DBMS), transaction managers enforce four cornerstone properties known as ACID:

1. Atomicity ("All or Nothing"):
A transaction cannot partially execute. Either every single operation within the transaction boundary commits permanently, or if an error or crash occurs, the database automatically rolls back all changes to restore the pre-transaction state. In relational databases like PostgreSQL, atomicity is maintained using a Write-Ahead Log (WAL) and undo logs.

2. Consistency:
A transaction must transition the database from one valid state to another valid state, preserving all explicit schemas, foreign keys, unique constraints, and domain invariants. If any operation violates a declarative constraint (e.g., negative balance in a bank account where balance >= 0 is required), the entire transaction is aborted.

3. Isolation:
Concurrent transactions executing simultaneously must not interfere with each other in ways that lead to race conditions. The ANSI SQL standard defines four isolation levels from lowest to highest: Read Uncommitted, Read Committed, Repeatable Read, and Serializable. Lower isolation levels improve concurrency throughput but risk phenomena such as Dirty Reads (reading uncommitted changes), Non-Repeatable Reads (values changing mid-transaction), and Phantom Reads (new rows appearing in range queries). Modern databases often employ Multi-Version Concurrency Control (MVCC) or Two-Phase Locking (2PL) to balance isolation and concurrency.

4. Durability:
Once a transaction receives confirmation of being committed, its changes are guaranteed to survive any subsequent system crash, power outage, or OS failure. This is achieved by synchronizing redo log records to non-volatile disk storage (fsync) before reporting success to the client application.`,
  },
  {
    id: 'econ-supply-demand',
    title: 'Supply, Demand, and Price Controls',
    subject: 'Economics',
    difficulty: 'easy',
    description: 'Equilibrium price, elasticity, consumer surplus, and price ceilings',
    content: `Principles of Microeconomics: Market Equilibrium and Government Interventions

In a competitive market economy, prices and quantities of goods are determined by the interaction of consumer demand and producer supply.

1. The Law of Demand and the Demand Curve:
The Law of Demand states that, ceteris paribus (all other factors held constant), as the price of a good increases, the quantity demanded decreases, resulting in a downward-sloping demand curve. A change in price causes a movement along the demand curve. In contrast, non-price determinants—such as changes in consumer income, tastes, preferences, or prices of substitute and complementary goods—shift the entire demand curve leftward or rightward.

2. The Law of Supply and Market Equilibrium:
The Law of Supply posits a direct positive relationship: as the price of a good rises, suppliers are willing and able to produce and sell more units, creating an upward-sloping supply curve. Market Equilibrium occurs at the precise intersection where quantity demanded equals quantity supplied (Qd = Qs). The resulting price is the equilibrium or market-clearing price. At prices above equilibrium, a surplus (excess supply) forces sellers to discount prices. At prices below equilibrium, a shortage (excess demand) bids prices up.

3. Government Interventions - Price Ceilings and Price Floors:
When governments determine that the equilibrium market price is socially unfair, they may impose legal price limits:
- Price Ceiling: A legal maximum price allowed by law. If a price ceiling is set below the equilibrium price (binding), it creates persistent shortages because quantity demanded exceeds quantity supplied at the lower price (e.g., rent control leads to housing waitlists and reduced maintenance).
- Price Floor: A legal minimum price. If set above equilibrium (e.g., minimum wage or agricultural price supports), it creates surpluses (e.g., surplus labor or excess grain crops).`,
  },
];
